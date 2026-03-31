import { createHash, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const hashPassword = (password: string) => {
  return createHash("sha256").update(password).digest("hex");
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export const verifyUserCredentials = async (email: string, password: string) => {
  const db = getDb();
  const foundUser = db
    .prepare(
      `SELECT id, name, email, password_hash, created_at
       FROM users
       WHERE lower(email) = lower(?)`
    )
    .get(email) as UserRow | undefined;

  if (!foundUser) {
    return null;
  }

  if (foundUser.password_hash !== hashPassword(password)) {
    return null;
  }

  return {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
  };
};

export const registerUser = async (input: {
  name: string;
  email: string;
  password: string;
}) => {
  const db = getDb();
  const exists = db
    .prepare("SELECT 1 FROM users WHERE lower(email) = lower(?)")
    .get(input.email) as { 1: number } | undefined;

  if (exists) {
    return { ok: false as const, error: "Email already registered." };
  }

  const newUser: StoredUser = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    newUser.id,
    newUser.name,
    newUser.email,
    newUser.passwordHash,
    newUser.createdAt
  );

  return {
    ok: true as const,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  };
};

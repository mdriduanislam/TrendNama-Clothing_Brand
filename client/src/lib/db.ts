import { DatabaseSync } from "node:sqlite";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

let dbInstance: DatabaseSync | null = null;

const sharedDataDir = path.resolve(process.cwd(), "..", "shared", "data");
const sharedDbPath = path.join(sharedDataDir, "app.db");
const isVercel = Boolean(process.env.VERCEL);
const dbPath = isVercel ? "/tmp/trendnama-app.db" : sharedDbPath;
const productsSeedPath = path.resolve(
  process.cwd(),
  "..",
  "shared",
  "data",
  "products.json"
);
const usersSeedPath = path.resolve(
  process.cwd(),
  "..",
  "shared",
  "data",
  "users.json"
);

const ensureDbFile = () => {
  if (!isVercel || existsSync(dbPath)) {
    return;
  }

  if (existsSync(sharedDbPath)) {
    copyFileSync(sharedDbPath, dbPath);
  }
};

const initializeSchema = (db: DatabaseSync) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      sizes_json TEXT NOT NULL,
      colors_json TEXT NOT NULL,
      images_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      selected_size TEXT NOT NULL,
      selected_color TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (user_id, product_id, selected_size, selected_color),
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stripe_session_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      selected_size TEXT NOT NULL,
      selected_color TEXT NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );
  `);
};

const seedProductsIfEmpty = (db: DatabaseSync) => {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM products").get() as {
    count: number;
  };

  if (countRow.count > 0) {
    return;
  }

  const products = JSON.parse(readFileSync(productsSeedPath, "utf-8")) as Array<{
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    category: string;
    sizes: string[];
    colors: string[];
    images: Record<string, string>;
    createdAt: string;
  }>;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO products (
      id,
      name,
      short_description,
      description,
      price,
      category,
      sizes_json,
      colors_json,
      images_json,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const product of products) {
    insert.run(
      product.id,
      product.name,
      product.shortDescription,
      product.description,
      product.price,
      product.category,
      JSON.stringify(product.sizes),
      JSON.stringify(product.colors),
      JSON.stringify(product.images),
      product.createdAt
    );
  }
};

const seedUsersIfEmpty = (db: DatabaseSync) => {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM users").get() as {
    count: number;
  };

  if (countRow.count > 0) {
    return;
  }

  const users = JSON.parse(readFileSync(usersSeedPath, "utf-8")) as Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
  }>;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const user of users) {
    insert.run(user.id, user.name, user.email, user.passwordHash, user.createdAt);
  }
};

export const getDb = () => {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDbFile();
  const db = new DatabaseSync(dbPath);
  initializeSchema(db);
  seedProductsIfEmpty(db);
  seedUsersIfEmpty(db);

  dbInstance = db;
  return db;
};

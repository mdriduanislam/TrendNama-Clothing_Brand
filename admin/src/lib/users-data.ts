import { getDb } from "@/lib/db";

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  status: "active";
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export const readAdminUsers = async (): Promise<AdminUser[]> => {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT
        id,
        name,
        email,
        created_at
      FROM users
      ORDER BY datetime(created_at) DESC`
    )
    .all() as UserRow[];

  return rows.map((row) => ({
    id: row.id,
    fullName: row.name,
    email: row.email,
    createdAt: row.created_at,
    status: "active",
  }));
};

export const readAdminUserById = async (id: string): Promise<AdminUser | null> => {
  const db = getDb();

  const row = db
    .prepare(
      `SELECT
        id,
        name,
        email,
        created_at
      FROM users
      WHERE id = ?`
    )
    .get(id) as UserRow | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.name,
    email: row.email,
    createdAt: row.created_at,
    status: "active",
  };
};

export const deleteAdminUsersByIds = async (ids: string[]) => {
  const db = getDb();

  const deleteOrderItemsByUser = db.prepare(
    `DELETE FROM order_items
     WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)`
  );
  const deleteOrdersByUser = db.prepare("DELETE FROM orders WHERE user_id = ?");
  const deleteCartByUser = db.prepare("DELETE FROM cart_items WHERE user_id = ?");
  const deleteUser = db.prepare("DELETE FROM users WHERE id = ?");

  for (const id of ids) {
    deleteOrderItemsByUser.run(id);
    deleteOrdersByUser.run(id);
    deleteCartByUser.run(id);
    deleteUser.run(id);
  }
};

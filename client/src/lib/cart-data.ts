import { getDb } from "@/lib/db";
import { CartItemType } from "@/types";

type CartRow = {
  user_id: string;
  product_id: string;
  selected_size: string;
  selected_color: string;
  quantity: number;
};

type ProductRow = {
  id: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  category: string;
  sizes_json: string;
  colors_json: string;
  images_json: string;
  created_at: string;
};

const mapCartItems = (rows: Array<CartRow & ProductRow>): CartItemType[] => {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    price: row.price,
    category: row.category,
    sizes: JSON.parse(row.sizes_json) as string[],
    colors: JSON.parse(row.colors_json) as string[],
    images: JSON.parse(row.images_json) as Record<string, string>,
    createdAt: row.created_at,
    quantity: row.quantity,
    selectedSize: row.selected_size,
    selectedColor: row.selected_color,
  }));
};

export const readCartForUser = async (userId: string): Promise<CartItemType[]> => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
        c.user_id,
        c.product_id,
        c.selected_size,
        c.selected_color,
        c.quantity,
        p.id,
        p.name,
        p.short_description,
        p.description,
        p.price,
        p.category,
        p.sizes_json,
        p.colors_json,
        p.images_json,
        p.created_at
      FROM cart_items c
      INNER JOIN products p ON p.id = c.product_id
      WHERE c.user_id = ?
      ORDER BY datetime(p.created_at) DESC`
    )
    .all(userId) as Array<CartRow & ProductRow>;

  return mapCartItems(rows);
};

export const upsertCartItem = async (input: {
  userId: string;
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}) => {
  const db = getDb();

  db.prepare(
    `INSERT INTO cart_items (user_id, product_id, selected_size, selected_color, quantity)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, product_id, selected_size, selected_color)
     DO UPDATE SET quantity = cart_items.quantity + excluded.quantity`
  ).run(
    input.userId,
    input.productId,
    input.selectedSize,
    input.selectedColor,
    input.quantity
  );
};

export const removeCartItem = async (input: {
  userId: string;
  productId: string;
  selectedSize: string;
  selectedColor: string;
}) => {
  const db = getDb();

  db.prepare(
    `DELETE FROM cart_items
     WHERE user_id = ? AND product_id = ? AND selected_size = ? AND selected_color = ?`
  ).run(input.userId, input.productId, input.selectedSize, input.selectedColor);
};

export const clearCartForUser = async (userId: string) => {
  const db = getDb();
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
};

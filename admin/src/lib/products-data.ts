import { getDb } from "@/lib/db";

export type StoredProduct = {
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

const mapProductRow = (row: ProductRow): StoredProduct => {
  return {
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
  };
};

export const readProducts = async (): Promise<StoredProduct[]> => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
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
      FROM products
      ORDER BY datetime(created_at) DESC`
    )
    .all() as ProductRow[];

  return rows.map(mapProductRow);
};

export const readProductById = async (id: string): Promise<StoredProduct | null> => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
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
      FROM products
      WHERE id = ?`
    )
    .get(id) as ProductRow | undefined;

  if (!row) {
    return null;
  }

  return mapProductRow(row);
};

export const createProduct = async (
  input: Omit<StoredProduct, "id" | "createdAt">
): Promise<StoredProduct> => {
  const db = getDb();
  const createdProduct: StoredProduct = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  db.prepare(
    `INSERT INTO products (
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    createdProduct.id,
    createdProduct.name,
    createdProduct.shortDescription,
    createdProduct.description,
    createdProduct.price,
    createdProduct.category,
    JSON.stringify(createdProduct.sizes),
    JSON.stringify(createdProduct.colors),
    JSON.stringify(createdProduct.images),
    createdProduct.createdAt
  );

  return createdProduct;
};

export const updateProductById = async (
  id: string,
  input: Omit<StoredProduct, "id" | "createdAt">
): Promise<StoredProduct | null> => {
  const db = getDb();
  const existing = await readProductById(id);

  if (!existing) {
    return null;
  }

  db.prepare(
    `UPDATE products
     SET
      name = ?,
      short_description = ?,
      description = ?,
      price = ?,
      category = ?,
      sizes_json = ?,
      colors_json = ?,
      images_json = ?
     WHERE id = ?`
  ).run(
    input.name,
    input.shortDescription,
    input.description,
    input.price,
    input.category,
    JSON.stringify(input.sizes),
    JSON.stringify(input.colors),
    JSON.stringify(input.images),
    id
  );

  return {
    ...existing,
    ...input,
  };
};

export const deleteProductsByIds = async (ids: string[]) => {
  const db = getDb();
  const deleteOne = db.prepare("DELETE FROM products WHERE id = ?");

  for (const id of ids) {
    deleteOne.run(id);
  }
};

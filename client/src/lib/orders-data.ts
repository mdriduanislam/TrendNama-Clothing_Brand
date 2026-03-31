import { randomUUID } from "node:crypto";

import { clearCartForUser, readCartForUser } from "@/lib/cart-data";
import { getDb } from "@/lib/db";

export type StoredOrderItem = {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  imageUrl: string;
};

export type StoredOrder = {
  id: string;
  userId: string;
  stripeSessionId: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: StoredOrderItem[];
};

type OrderRow = {
  id: string;
  user_id: string;
  stripe_session_id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  selected_size: string;
  selected_color: string;
  image_url: string;
};

const mapOrderItems = (rows: OrderItemRow[]): StoredOrderItem[] => {
  return rows.map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    productPrice: item.product_price,
    quantity: item.quantity,
    selectedSize: item.selected_size,
    selectedColor: item.selected_color,
    imageUrl: item.image_url,
  }));
};

const mapOrder = (order: OrderRow, items: OrderItemRow[]): StoredOrder => {
  return {
    id: order.id,
    userId: order.user_id,
    stripeSessionId: order.stripe_session_id,
    status: order.status,
    totalAmount: order.total_amount,
    currency: order.currency,
    createdAt: order.created_at,
    items: mapOrderItems(items),
  };
};

export const readOrdersForUser = async (userId: string): Promise<StoredOrder[]> => {
  const db = getDb();
  const orders = db
    .prepare(
      `SELECT
        id,
        user_id,
        stripe_session_id,
        status,
        total_amount,
        currency,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC`
    )
    .all(userId) as OrderRow[];

  const readItems = db.prepare(
    `SELECT
      id,
      order_id,
      product_id,
      product_name,
      product_price,
      quantity,
      selected_size,
      selected_color,
      image_url
    FROM order_items
    WHERE order_id = ?`
  );

  return orders.map((order) => {
    const items = readItems.all(order.id) as OrderItemRow[];
    return mapOrder(order, items);
  });
};

export const completePaidOrderFromCart = async (input: {
  userId: string;
  stripeSessionId: string;
  totalAmount: number;
  currency: string;
}) => {
  const db = getDb();

  const existing = db
    .prepare(
      `SELECT
        id,
        user_id,
        stripe_session_id,
        status,
        total_amount,
        currency,
        created_at
      FROM orders
      WHERE stripe_session_id = ?`
    )
    .get(input.stripeSessionId) as OrderRow | undefined;

  if (existing) {
    const items = db
      .prepare(
        `SELECT
          id,
          order_id,
          product_id,
          product_name,
          product_price,
          quantity,
          selected_size,
          selected_color,
          image_url
        FROM order_items
        WHERE order_id = ?`
      )
      .all(existing.id) as OrderItemRow[];

    return mapOrder(existing, items);
  }

  const cart = await readCartForUser(input.userId);

  if (!cart.length) {
    return null;
  }

  const orderId = randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO orders (
      id,
      user_id,
      stripe_session_id,
      status,
      total_amount,
      currency,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    orderId,
    input.userId,
    input.stripeSessionId,
    "paid",
    input.totalAmount,
    input.currency,
    createdAt
  );

  const insertItem = db.prepare(
    `INSERT INTO order_items (
      id,
      order_id,
      product_id,
      product_name,
      product_price,
      quantity,
      selected_size,
      selected_color,
      image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const item of cart) {
    insertItem.run(
      randomUUID(),
      orderId,
      item.id,
      item.name,
      item.price,
      item.quantity,
      item.selectedSize,
      item.selectedColor,
      item.images[item.selectedColor]
    );
  }

  await clearCartForUser(input.userId);

  return {
    id: orderId,
    userId: input.userId,
    stripeSessionId: input.stripeSessionId,
    status: "paid",
    totalAmount: input.totalAmount,
    currency: input.currency,
    createdAt,
    items: cart.map((item) => ({
      id: randomUUID(),
      productId: item.id,
      productName: item.name,
      productPrice: item.price,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      imageUrl: item.images[item.selectedColor],
    })),
  } satisfies StoredOrder;
};

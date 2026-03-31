import { getDb } from "@/lib/db";

export type AdminOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  productPrice: number;
};

export type AdminOrder = {
  id: string;
  stripeSessionId: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: AdminOrderItem[];
};

type OrderRow = {
  id: string;
  stripe_session_id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
};

type ItemRow = {
  id: string;
  product_name: string;
  quantity: number;
  selected_size: string;
  selected_color: string;
  product_price: number;
};

export const readAdminOrders = async (): Promise<AdminOrder[]> => {
  const db = getDb();

  const orders = db
    .prepare(
      `SELECT
        o.id,
        o.stripe_session_id,
        o.status,
        o.total_amount,
        o.currency,
        o.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ORDER BY datetime(o.created_at) DESC`
    )
    .all() as OrderRow[];

  const readItems = db.prepare(
    `SELECT
      id,
      product_name,
      quantity,
      selected_size,
      selected_color,
      product_price
    FROM order_items
    WHERE order_id = ?`
  );

  return orders.map((order) => {
    const itemsRows = readItems.all(order.id) as ItemRow[];

    return {
      id: order.id,
      stripeSessionId: order.stripe_session_id,
      status: order.status,
      totalAmount: order.total_amount,
      currency: order.currency,
      createdAt: order.created_at,
      userId: order.user_id,
      userName: order.user_name,
      userEmail: order.user_email,
      items: itemsRows.map((item) => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
        selectedSize: item.selected_size,
        selectedColor: item.selected_color,
        productPrice: item.product_price,
      })),
    };
  });
};

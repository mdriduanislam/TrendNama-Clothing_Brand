"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  imageUrl: string;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as { orders?: Order[]; error?: string };

        if (!response.ok) {
          setError(result.error || "Could not load your orders.");
          return;
        }

        setOrders(result.orders || []);
      } catch {
        setError("Network error while loading orders.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, []);

  return (
    <div className="mt-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Completed payments are listed here.
        </p>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading your orders...</p>}

      {!isLoading && error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <p className="text-sm text-gray-500">You have no completed orders yet.</p>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium uppercase text-green-700">{order.status}</p>
                  <p className="font-semibold">
                    {order.currency} {order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-gray-50 rounded-md overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-500">
                          Size: {item.selectedSize} | Color: {item.selectedColor}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

import { readAdminOrders } from "@/lib/orders-data";

const OrdersPage = async () => {
  const orders = await readAdminOrders();

  return (
    <div>
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Paid Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No completed orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="rounded-md border p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="font-medium">{order.userName}</p>
                  <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm md:text-right">
                  <p className="uppercase text-green-700 font-medium">{order.status}</p>
                  <p className="font-semibold">
                    {order.currency} {order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Stripe: {order.stripeSessionId}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm border rounded-md px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} | Size: {item.selectedSize} | Color: {item.selectedColor}
                      </p>
                    </div>
                    <p className="font-medium">
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

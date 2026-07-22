import { Badge } from "@/components/ui/Badge";

const orders = [
  { id: "ORD-7421", status: "delivered" as const, amount: "$129.00", date: "Jan 15" },
  { id: "ORD-7422", status: "processing" as const, amount: "$89.00", date: "Jan 16" },
  { id: "ORD-7423", status: "shipped" as const, amount: "$249.00", date: "Jan 16" },
  { id: "ORD-7424", status: "cancelled" as const, amount: "$59.00", date: "Jan 15" },
];

export function OrderStatusSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Order Status</h3>
      <div className="surface overflow-hidden rounded-xl border shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-muted border-b text-left text-sm font-medium">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-border/50 border-b last:border-0">
                <td className="px-5 py-4 text-base font-medium">{order.id}</td>
                <td className="px-5 py-4">
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "success"
                        : order.status === "processing"
                          ? "info"
                          : order.status === "shipped"
                            ? "warning"
                            : "error"
                    }
                    size="sm"
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-base">{order.amount}</td>
                <td className="text-muted px-5 py-4 text-sm">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

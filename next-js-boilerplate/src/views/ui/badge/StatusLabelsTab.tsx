"use client";

import { Badge, BadgeButton } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const users = [
  {
    name: "Alice Chen",
    role: "Admin",
    status: "online" as const,
    avatar: "AC",
  },
  { name: "Bob Kumar", role: "Editor", status: "away" as const, avatar: "BK" },
  {
    name: "Carol Smith",
    role: "Viewer",
    status: "offline" as const,
    avatar: "CS",
  },
];

function statusColor(status: "online" | "away" | "offline") {
  if (status === "online") return "bg-success";
  if (status === "away") return "bg-warning";
  return "bg-border";
}

const orders = [
  {
    id: "ORD-7421",
    status: "delivered" as const,
    amount: "$129.00",
    date: "Jan 15",
  },
  {
    id: "ORD-7422",
    status: "processing" as const,
    amount: "$89.00",
    date: "Jan 16",
  },
  {
    id: "ORD-7423",
    status: "shipped" as const,
    amount: "$249.00",
    date: "Jan 16",
  },
  {
    id: "ORD-7424",
    status: "cancelled" as const,
    amount: "$59.00",
    date: "Jan 15",
  },
];

export function StatusLabelsTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">User Roles</h3>
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div
              key={user.name}
              className="surface flex items-center gap-4 rounded-lg border p-4 shadow-sm"
            >
              <div className="relative">
                <div className="bg-surface flex size-12 items-center justify-center rounded-full text-base font-medium">
                  {user.avatar}
                </div>
                <span
                  className={cn(
                    "border-bg absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2",
                    statusColor(user.status),
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium">{user.name}</p>
                <p className="text-muted text-sm">{user.status}</p>
              </div>
              <Badge
                variant={
                  user.role === "Admin"
                    ? "default"
                    : user.role === "Editor"
                      ? "secondary"
                      : "outline"
                }
                size="sm"
              >
                {user.role}
              </Badge>
            </div>
          ))}
        </div>
      </section>

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
                <tr
                  key={order.id}
                  className="border-border/50 border-b last:border-0"
                >
                  <td className="px-5 py-4 text-base font-medium">
                    {order.id}
                  </td>
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
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
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

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Priority Labels</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="error" size="sm">
            Urgent
          </Badge>
          <Badge variant="warning" size="sm">
            High
          </Badge>
          <Badge variant="info" size="sm">
            Normal
          </Badge>
          <Badge variant="secondary" size="sm">
            Low
          </Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Payment Status</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" size="sm">
            Paid
          </Badge>
          <Badge variant="warning" size="sm">
            Pending
          </Badge>
          <Badge variant="error" size="sm">
            Failed
          </Badge>
          <Badge variant="outline" size="sm">
            Refunded
          </Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Button Badges</h3>
        <div className="flex flex-wrap gap-3">
          <BadgeButton variant="default">Add tag</BadgeButton>
          <BadgeButton variant="secondary">Dismiss</BadgeButton>
          <BadgeButton variant="outline">Filter</BadgeButton>
          <BadgeButton variant="error">Remove</BadgeButton>
          <BadgeButton variant="success">Approve</BadgeButton>
        </div>
      </section>
    </div>
  );
}

"use client";

import { Badge, BadgeButton } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { BadgeSize, BadgeVariant } from "@/types/ui/Badge-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function NotificationPatternsTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Notification Bell</h3>
        <div className="flex items-center gap-8">
          <div className="relative inline-flex">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute -top-3 -right-3">
              <Badge variant="error" size="sm">3</Badge>
            </span>
          </div>
          <div className="relative inline-flex">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute -top-3 -right-3">
              <Badge variant="error" size="sm">99+</Badge>
            </span>
          </div>
          <div className="relative inline-flex">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute -top-2 -right-2">
              <Badge variant="error" dot />
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Toast Notifications</h3>
        <div className="flex flex-col gap-4">
          <div className="surface flex items-start gap-4 rounded-lg border p-5 shadow-sm">
            <span className="mt-1">
              <Badge variant="success" size="sm">New</Badge>
            </span>
            <div className="flex-1">
              <p className="text-base font-medium">Payment received</p>
              <p className="text-muted text-sm">$249.00 from Acme Corp</p>
            </div>
            <span className="text-muted text-sm">2m ago</span>
          </div>
          <div className="surface flex items-start gap-4 rounded-lg border p-5 shadow-sm">
            <span className="mt-1">
              <Badge variant="warning" size="sm">Pending</Badge>
            </span>
            <div className="flex-1">
              <p className="text-base font-medium">Invoice due soon</p>
              <p className="text-muted text-sm">Invoice #1042 due in 3 days</p>
            </div>
            <span className="text-muted text-sm">1h ago</span>
          </div>
          <div className="surface flex items-start gap-4 rounded-lg border p-5 shadow-sm">
            <span className="mt-1">
              <Badge variant="error" size="sm">Failed</Badge>
            </span>
            <div className="flex-1">
              <p className="text-base font-medium">Subscription renewal failed</p>
              <p className="text-muted text-sm">Please update your payment method</p>
            </div>
            <span className="text-muted text-sm">3h ago</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Message Notifications</h3>
        <div className="flex items-center gap-6">
          <div className="relative inline-flex">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="absolute -top-3 -right-3">
              <Badge variant="default" size="sm">5</Badge>
            </span>
          </div>
          <div className="relative inline-flex">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="absolute -top-3 -right-3">
              <Badge variant="info" size="sm">12</Badge>
            </span>
          </div>
          <div className="relative inline-flex">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="absolute -top-3 -right-3">
              <Badge variant="soft" size="sm">3</Badge>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

const users = [
  { name: "Alice Chen", role: "Admin", status: "online" as const, avatar: "AC" },
  { name: "Bob Kumar", role: "Editor", status: "away" as const, avatar: "BK" },
  { name: "Carol Smith", role: "Viewer", status: "offline" as const, avatar: "CS" },
];

function statusColor(status: "online" | "away" | "offline") {
  if (status === "online") return "bg-success";
  if (status === "away") return "bg-warning";
  return "bg-border";
}

const orders = [
  { id: "ORD-7421", status: "delivered" as const, amount: "$129.00", date: "Jan 15" },
  { id: "ORD-7422", status: "processing" as const, amount: "$89.00", date: "Jan 16" },
  { id: "ORD-7423", status: "shipped" as const, amount: "$249.00", date: "Jan 16" },
  { id: "ORD-7424", status: "cancelled" as const, amount: "$59.00", date: "Jan 15" },
];

function StatusLabelsTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">User Roles</h3>
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.name} className="surface flex items-center gap-4 rounded-lg border p-4 shadow-sm">
              <div className="relative">
                <div className="bg-surface flex size-12 items-center justify-center rounded-full text-base font-medium">
                  {user.avatar}
                </div>
                <span className={cn("absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-bg", statusColor(user.status))} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium">{user.name}</p>
                <p className="text-muted text-sm">{user.status}</p>
              </div>
              <Badge
                variant={user.role === "Admin" ? "default" : user.role === "Editor" ? "secondary" : "outline"}
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
        <div className="surface rounded-xl border shadow-sm">
          <div className="grid grid-cols-4 border-b px-4 py-2.5 text-sm font-medium text-muted">
            <span>Order</span>
            <span>Status</span>
            <span>Amount</span>
            <span>Date</span>
          </div>
          {orders.map((order) => (
            <div key={order.id} className="grid grid-cols-4 items-center border-b border-border/50 px-4 py-4 last:border-0">
              <span className="text-base font-medium">{order.id}</span>
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
              <span className="text-base">{order.amount}</span>
              <span className="text-muted text-sm">{order.date}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Priority Labels</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="error" size="sm">Urgent</Badge>
          <Badge variant="warning" size="sm">High</Badge>
          <Badge variant="info" size="sm">Normal</Badge>
          <Badge variant="secondary" size="sm">Low</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Payment Status</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" size="sm">Paid</Badge>
          <Badge variant="warning" size="sm">Pending</Badge>
          <Badge variant="error" size="sm">Failed</Badge>
          <Badge variant="outline" size="sm">Refunded</Badge>
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

const examples: UIExample[] = [
  {
    id: "notifications",
    title: "Notifications",
    description: "Bell icons, toasts, and message badges.",
    render: () => <NotificationPatternsTab />,
  },
  {
    id: "status",
    title: "Status & Labels",
    description: "User roles, order status, and priority labels.",
    render: () => <StatusLabelsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={[
          "default",
          "secondary",
          "outline",
          "soft",
          "info",
          "success",
          "warning",
          "error",
        ]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <Badge variant={variant as BadgeVariant} size={size as BadgeSize}>
            {variant}
          </Badge>
        )}
      />
    ),
  },
];

export default function BadgePage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Badge"
      intro="Displays a badge or a component that looks like a badge."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

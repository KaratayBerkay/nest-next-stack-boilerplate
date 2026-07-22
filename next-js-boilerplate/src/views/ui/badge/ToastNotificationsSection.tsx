import { Badge } from "@/components/ui/Badge";

export function ToastNotificationsSection() {
  return (
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
  );
}

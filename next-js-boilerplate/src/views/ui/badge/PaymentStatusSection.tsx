import { Badge } from "@/components/ui/Badge";

export function PaymentStatusSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Payment Status</h3>
      <div className="flex flex-wrap gap-3">
        <Badge variant="success" size="sm">Paid</Badge>
        <Badge variant="warning" size="sm">Pending</Badge>
        <Badge variant="error" size="sm">Failed</Badge>
        <Badge variant="outline" size="sm">Refunded</Badge>
      </div>
    </section>
  );
}

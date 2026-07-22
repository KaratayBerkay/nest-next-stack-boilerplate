import { Badge } from "@/components/ui/Badge";

export function PriorityLabelsSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Priority Labels</h3>
      <div className="flex flex-wrap gap-3">
        <Badge variant="error" size="sm">Urgent</Badge>
        <Badge variant="warning" size="sm">High</Badge>
        <Badge variant="info" size="sm">Normal</Badge>
        <Badge variant="secondary" size="sm">Low</Badge>
      </div>
    </section>
  );
}

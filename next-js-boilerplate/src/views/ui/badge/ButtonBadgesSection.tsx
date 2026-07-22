import { BadgeButton } from "@/components/ui/Badge";

export function ButtonBadgesSection() {
  return (
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
  );
}

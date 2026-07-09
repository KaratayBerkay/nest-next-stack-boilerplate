import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team",
  description: "Manage your team",
};

export default function TeamSlot() {
  return (
    <section
      data-testid="slot-team"
      className="surface flex flex-col gap-1 p-5"
    >
      <h2 className="text-brand text-sm font-semibold">Team</h2>
      <p className="text-muted text-sm">
        Rendered by the <code>@team</code> slot.
      </p>
    </section>
  );
}

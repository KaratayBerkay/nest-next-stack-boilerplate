export default function AnalyticsSlot() {
  return (
    <section
      data-testid="slot-analytics"
      className="surface flex flex-col gap-1 p-5"
    >
      <h2 className="text-brand text-sm font-semibold">Analytics</h2>
      <p className="text-muted text-sm">
        Rendered by the <code>@analytics</code> slot.
      </p>
    </section>
  );
}

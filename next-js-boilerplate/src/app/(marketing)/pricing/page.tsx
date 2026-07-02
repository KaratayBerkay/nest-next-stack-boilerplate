export default function PricingPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1
        data-testid="page-heading"
        className="text-2xl font-semibold tracking-tight"
      >
        Pricing
      </h1>
      <p className="text-muted text-sm">
        Served at <code>/pricing</code> — same <code>(marketing)</code> group,
        same shared layout, no group prefix in the URL.
      </p>
    </div>
  );
}

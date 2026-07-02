export default function AboutPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1
        data-testid="page-heading"
        className="text-2xl font-semibold tracking-tight"
      >
        About
      </h1>
      <p className="text-muted text-sm">
        Served at <code>/about</code> — the <code>(marketing)</code> group
        prefix is absent from the URL.
      </p>
    </div>
  );
}

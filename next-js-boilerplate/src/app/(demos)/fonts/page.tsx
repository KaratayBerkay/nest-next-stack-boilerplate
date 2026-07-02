export default function FontsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">Font Optimization</h2>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Geist Sans (body)
        </h3>
        <p className="font-sans text-sm" data-testid="font-sans">
          The quick brown fox jumps over the lazy dog. — Geist Sans via
          next/font/google.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Geist Mono (code)
        </h3>
        <code className="font-mono text-sm" data-testid="font-mono">
          const font = &quot;Geist Mono&quot;;
        </code>
      </section>
    </div>
  );
}

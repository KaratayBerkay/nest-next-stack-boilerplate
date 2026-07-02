import { headers } from "next/headers";
import { Suspense } from "react";
import { containerClass } from "@/constants/site";

// Reading `headers()` opts this segment into dynamic rendering, which is what a
// per-request nonce requires. Kept inside <Suspense> so the rest can stream.
async function NoncePanel() {
  const nonce = (await headers()).get("x-nonce");

  return (
    <div
      className="flex flex-col gap-1 rounded border p-3 text-sm"
      data-testid="csp-nonce-panel"
    >
      <span className="text-muted">
        Per-request nonce (from the <code className="text-brand">x-nonce</code>{" "}
        request header set by <code className="text-brand">proxy.ts</code>):
      </span>
      <span className="font-mono break-all" data-testid="csp-nonce">
        {nonce ?? "(none)"}
      </span>
    </div>
  );
}

export default function CspPage() {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Content Security Policy (nonce)
        </h1>
        <p className="text-muted max-w-xl text-sm">
          <code className="text-brand">proxy.ts</code> generates a fresh nonce
          per request and sets a strict{" "}
          <code className="text-brand">Content-Security-Policy</code> with{" "}
          <code>&apos;strict-dynamic&apos;</code>. Next.js applies the nonce to
          its own script tags automatically, so any inline script without it is
          blocked.
        </p>
      </header>
      <section className="surface flex flex-col gap-3 p-5">
        <Suspense
          fallback={
            <div className="rounded border p-3 text-sm text-zinc-400">
              Reading nonce...
            </div>
          }
        >
          <NoncePanel />
        </Suspense>
        <p className="text-muted text-xs">
          Because a nonce requires <strong>dynamic rendering</strong>, this
          strict CSP is scoped to <code>/security/*</code> in the proxy —
          applying it app-wide would conflict with <code>cacheComponents</code>{" "}
          (PPR), whose prerendered static shells cannot carry a per-request
          nonce.
        </p>
      </section>
    </main>
  );
}

// Ported from next-js-boilerplate/src/app/(demos)/scripts/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Scripts",
  description: "Script loading demo",
};

export const Route = createFileRoute("/_demos/scripts/")({
  head: () => metadataToHead(metadata),
  component: ScriptsPage,
});

function ScriptsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">Script Optimization</h2>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          afterInteractive (default)
        </h3>
        <p className="text-muted text-sm">
          Logs &quot;Script loaded: afterInteractive&quot; to console after
          hydration.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          lazyOnload
        </h3>
        <p className="text-muted text-sm">
          Logs &quot;Script loaded: lazyOnload&quot; during browser idle time.
        </p>
      </section>

      <p className="text-xs text-zinc-400" data-testid="script-status">
        Open the browser console to see script strategy logs.
      </p>

      <Script
        id="script-after-interactive"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `console.log("Script loaded: afterInteractive")`,
        }}
      />
      <Script
        id="script-lazy-onload"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `console.log("Script loaded: lazyOnload")`,
        }}
      />
    </div>
  );
}

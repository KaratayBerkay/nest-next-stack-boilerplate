// Ported from next-js-boilerplate/src/app/(demos)/static/page.tsx
// Build-time prerendering becomes a server-boot constant: the module scope of
// a server function runs once per server process, so the timestamp is fixed
// for the lifetime of the deployment — the closest analogue to a static build.
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Static",
  description: "Static generation demo",
};

const bootTimestamp = new Date().toISOString();

const getBuildTimestamp = createServerFn().handler(async () => bootTimestamp);

export const Route = createFileRoute("/_demos/static/")({
  loader: () => getBuildTimestamp(),
  staleTime: Infinity,
  head: () => metadataToHead(metadata),
  component: StaticPage,
});

function StaticPage() {
  const builtAt = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Static rendering</h2>
      <p className="text-muted text-sm">
        This page&apos;s timestamp was captured once when the server booted.
      </p>
      <p className="text-xs text-zinc-500">
        Built at:{" "}
        <span className="font-mono" data-testid="static-timestamp">
          {builtAt}
        </span>
      </p>
    </div>
  );
}

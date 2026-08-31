// Ported from next-js-boilerplate/src/app/routing/b/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { Counter } from "@/components/ui/Counter";

export const metadata: Metadata = {
  title: "Route B",
  description: "Demo route B",
};

export const Route = createFileRoute("/routing/b/")({
  head: () => metadataToHead(metadata),
  component: RoutingPageB,
});

function RoutingPageB() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Demo B</h2>
      <div className="text-xs text-zinc-500">
        <Counter label="page" />
      </div>
    </div>
  );
}

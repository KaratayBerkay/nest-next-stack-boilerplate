// Ported from next-js-boilerplate/src/app/routing/a/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { Counter } from "@/components/ui/Counter";

export const metadata: Metadata = {
  title: "Route A",
  description: "Demo route A",
};

export const Route = createFileRoute("/routing/a/")({
  head: () => metadataToHead(metadata),
  component: RoutingPageA,
});

function RoutingPageA() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Demo A</h2>
      <div className="text-xs text-zinc-500">
        <Counter label="page" />
      </div>
    </div>
  );
}

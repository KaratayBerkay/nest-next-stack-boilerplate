// Ported from next-js-boilerplate/src/app/routing/boom/page.tsx
// (+ routing/boom/error.tsx as the route's errorComponent)
import {
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RoutingBoom } from "@/views/boom/RoutingBoom";
import { ErrorPage } from "@/features/statics";

export const metadata: Metadata = {
  title: "Error Handling",
  description: "Error boundary demo",
};

export const Route = createFileRoute("/routing/boom/")({
  head: () => metadataToHead(metadata),
  component: BoomPage,
  errorComponent: BoomError,
});

function BoomError({ error, reset }: ErrorComponentProps) {
  return (
    <div
      data-testid="error-boundary"
      className="surface flex flex-col gap-2 p-5"
    >
      <ErrorPage error={error} reset={reset} />
    </div>
  );
}

function BoomPage() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-brand text-sm font-semibold">Error handling</h2>
      <p className="text-muted text-sm">
        Trigger a render error; the segment&apos;s <code>error.tsx</code>{" "}
        catches it and offers a reset.
      </p>
      <RoutingBoom />
    </div>
  );
}

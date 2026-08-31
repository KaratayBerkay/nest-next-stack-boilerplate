// Ported from next-js-boilerplate/src/app/routing/items/[id]/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Item Detail",
  description: "View item details",
};

export const Route = createFileRoute("/routing/items/$id/")({
  head: () => metadataToHead(metadata),
  component: ItemPage,
});

// Dynamic route segment: `$id` matches any single path segment. The resolved
// id is rendered into the initial HTML — server-rendered, not filled in on
// the client.
function ItemPage() {
  const { id } = Route.useParams();
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Dynamic route</h2>
      <p className="text-muted text-sm">
        Segment <code>$id</code> resolved to{" "}
        <strong data-testid="item-id">{id}</strong>.
      </p>
    </div>
  );
}

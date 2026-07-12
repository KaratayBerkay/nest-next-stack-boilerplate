import type { Metadata } from "next";
import { Suspense } from "react";
import type {
  ItemContentProps,
  ItemPageProps,
} from "@/types/routing/ItemContent-types";
import { RoutingItemFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Item Detail",
  description: "View item details",
};

// Dynamic route segment: `[id]` matches any single path segment. The resolved id
// is rendered into the initial HTML — it is server-rendered, not filled in on
// the client. The `params` Promise (runtime data) is read inside `<Suspense>` so
// the page shell can be prerendered statically.
async function ItemContent({ params }: ItemContentProps) {
  const { id } = await params;
  return (
    <>
      <h2 className="text-brand text-sm font-semibold">Dynamic route</h2>
      <p className="text-muted text-sm">
        Segment <code>[id]</code> resolved to{" "}
        <strong data-testid="item-id">{id}</strong>.
      </p>
    </>
  );
}

export default function ItemPage({ params }: ItemPageProps) {
  return (
    <div className="flex flex-col gap-2">
      <Suspense fallback={<RoutingItemFallback />}>
        <ItemContent params={params} />
      </Suspense>
    </div>
  );
}

// Ported from next-js-boilerplate/src/app/routing/metadata-demo/[slug]/page.tsx
// generateMetadata becomes a param-aware head() — no server round-trip needed.
import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";

export const Route = createFileRoute("/routing/metadata-demo/$slug/")({
  head: ({ params }) =>
    metadataToHead({
      title: `${params.slug} — dynamic`,
      description: `Dynamically generated metadata for slug: ${params.slug}.`,
      openGraph: {
        title: `${params.slug} — OG`,
        description: `OG description for ${params.slug}.`,
      },
    }),
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Slug: {slug}</h1>
      <p className="text-muted text-sm">
        This page uses a param-aware <code>head()</code> to set the title and OG
        tags dynamically based on the route param.
      </p>
    </div>
  );
}

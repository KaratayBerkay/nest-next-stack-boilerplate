// Ported from next-js-boilerplate/src/app/(demos)/search-params/page.tsx
// The "server searchParams prop" half becomes a loader that receives the
// validated search via loaderDeps and echoes it through a server function.
import { createFileRoute } from "@tanstack/react-router";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { createServerFn } from "@tanstack/react-start";
import { SearchParamsDisplay } from "@/views/demos/search-params/SearchParamsDisplay";
import { SearchParamsClientFallback } from "@/fallbacks";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Search Params",
  description: "Search parameters demo",
};

const echoSearchParams = createServerFn()
  .validator((input: { name?: string; category?: string }) => input)
  .handler(async ({ data }) => data);

export const Route = createFileRoute("/_demos/search-params/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { name?: string; category?: string } => ({
    name: typeof search.name === "string" ? search.name : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => echoSearchParams({ data: deps }),
  head: () => metadataToHead(metadata),
  component: SearchParamsPage,
});

function SearchParamsPage() {
  const serverParams = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">Search Params</h2>

      <div
        className="border-border rounded p-3 text-sm"
        data-testid="server-params"
      >
        <span className="font-semibold">Server (loader deps):</span> name=
        {serverParams.name ?? "unknown"}, category=
        {serverParams.category ?? "none"}
      </div>

      <Suspense fallback={<SearchParamsClientFallback />}>
        <SearchParamsDisplay />
      </Suspense>

      <nav className="flex gap-2">
        <Link
          className="bg-fg text-bg rounded px-3 py-1 text-xs"
          href="/search-params?name=alice&category=books"
        >
          alice / books
        </Link>
        <Link
          className="bg-fg text-bg rounded px-3 py-1 text-xs"
          href="/search-params?name=bob&category=games"
        >
          bob / games
        </Link>
      </nav>
    </div>
  );
}

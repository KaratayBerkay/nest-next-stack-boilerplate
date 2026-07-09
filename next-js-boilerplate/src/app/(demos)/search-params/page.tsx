import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchParamsDisplay } from "./SearchParamsDisplay";
import type { SearchParamsPageProps, ServerParamsProps } from "@/types/demos/SearchParamsPage-types";

export const metadata: Metadata = {
  title: "Search Params",
  description: "Search parameters demo",
};

export default function SearchParamsPage({
  searchParams,
}: SearchParamsPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">Search Params</h2>

      <Suspense
        fallback={
          <div className="text-muted animate-pulse text-sm">
            Loading server params...
          </div>
        }
      >
        <ServerParams searchParams={searchParams} />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-muted animate-pulse text-sm">
            Loading client params...
          </div>
        }
      >
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

async function ServerParams({
  searchParams,
}: ServerParamsProps) {
  const { name, category } = await searchParams;

  return (
    <div
      className="border-border rounded p-3 text-sm"
      data-testid="server-params"
    >
      <span className="font-semibold">Server (searchParams prop):</span> name=
      {name ?? "unknown"}, category={category ?? "none"}
    </div>
  );
}

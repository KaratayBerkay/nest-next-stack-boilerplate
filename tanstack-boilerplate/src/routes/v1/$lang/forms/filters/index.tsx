// Ported from next-js-boilerplate/src/app/v1/[lang]/forms/filters/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/filters/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/filters/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): Record<string, string | Array<string> | undefined> => {
    const out: Record<string, string | Array<string> | undefined> = {};
    for (const [key, value] of Object.entries(search)) {
      if (typeof value === "string") out[key] = value;
      else if (
        Array.isArray(value) &&
        value.every((v) => typeof v === "string")
      )
        out[key] = value as Array<string>;
    }
    return out;
  },
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.filtersTitle",
      "examples.filtersDescription",
    ),
  component: FiltersPage,
});

function FiltersPage() {
  const search = Route.useSearch();
  return <PageContent initialSearchParams={search} />;
}

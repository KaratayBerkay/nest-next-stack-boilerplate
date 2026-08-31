// Ported from next-js-boilerplate/src/app/v1/[lang]/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/config";
import { metadataToHead } from "@/lib/head";

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/")({
  head: ({ params }) =>
    metadataToHead({
      title: isLocale(params.lang) ? `v1 · ${params.lang}` : "v1",
    }),
  component: V1Home,
});

function V1Home() {
  const { lang } = Route.useParams();
  const { messages } = v1Route.useLoaderData();
  const t = isLocale(lang) ? messages.v1 : null;

  return (
    <div className="flex flex-col gap-6" lang={lang}>
      <div className="space-y-1">
        <p className="text-brand text-xs font-semibold tracking-wide uppercase">
          Version v1 · locale <span data-testid="active-locale">{lang}</span>
        </p>
        <h2 className="text-lg font-bold" data-testid="v1-greeting">
          {t?.greeting ?? "Welcome to v1"}
        </h2>
        <p className="text-muted text-sm">
          This page is wrapped by the <code>/v1/$lang</code> layout route. Use
          the links below to see the segment&apos;s custom error and not-found
          boundaries.
        </p>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        <li>
          <Link href={`/v1/${lang}/boom`} className="text-brand underline">
            Trigger a render error
          </Link>{" "}
          → caught by the layout&apos;s <code>errorComponent</code>
        </li>
        <li>
          <Link href={`/v1/${lang}/missing`} className="text-brand underline">
            Visit a missing resource
          </Link>{" "}
          → caught by the layout&apos;s <code>notFoundComponent</code> (HTTP
          404)
        </li>
      </ul>
    </div>
  );
}

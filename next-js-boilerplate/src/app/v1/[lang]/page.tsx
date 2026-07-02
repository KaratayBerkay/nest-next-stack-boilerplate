import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/get-messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return { title: isLocale(lang) ? `v1 · ${lang}` : "v1" };
}

// Reads the `[lang]` param (runtime data) inside <Suspense> so the page builds
// cleanly under `cacheComponents` — same pattern as i18n/[lang] and items/[id].
async function V1Content({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  // proxy.ts guarantees a supported locale reaches this page; the messages
  // give us a localized greeting to prove version + lang are wired together.
  const t = isLocale(lang) ? await getMessages(lang, "v1") : null;

  return (
    <div className="flex flex-col gap-5" lang={lang}>
      <div className="space-y-1">
        <p className="text-brand text-xs font-semibold tracking-wide uppercase">
          Version v1 · locale <span data-testid="active-locale">{lang}</span>
        </p>
        <h2 className="text-lg font-bold" data-testid="v1-greeting">
          {t?.greeting ?? "Welcome to v1"}
        </h2>
        <p className="text-muted text-sm">
          This page is wrapped by <code>v1/[lang]/layout.tsx</code>. Use the
          links below to see the segment&apos;s custom error and not-found
          boundaries.
        </p>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        <li>
          <Link href={`/v1/${lang}/boom`} className="text-brand underline">
            Trigger a render error
          </Link>{" "}
          → caught by <code>v1/[lang]/error.tsx</code>
        </li>
        <li>
          <Link href={`/v1/${lang}/missing`} className="text-brand underline">
            Visit a missing resource
          </Link>{" "}
          → caught by <code>v1/[lang]/not-found.tsx</code> (HTTP 404)
        </li>
      </ul>
    </div>
  );
}

export default function V1Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <V1Content params={params} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/get-messages";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { LocaleContentProps, I18nPageProps, GenerateMetadataProps } from "@/types/i18n/LocaleContent-types";

// Prerender one static page per supported locale at build time. Unsupported
// locales (e.g. /i18n/fr) are rejected upstream in `proxy.ts` with a deterministic
// 404 — the docs' usual gate, `export const dynamicParams = false`, is rejected by
// `cacheComponents` (see docs gotcha #18).
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getMessages(lang, "i18n");
  return { title: t.title };
}

// Reads the `[lang]` param (runtime data) inside `<Suspense>` so the page builds
// cleanly under `cacheComponents` — same pattern as routing/items/[id].
async function LocaleContent({
  params,
}: LocaleContentProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getMessages(lang, "i18n");
  const shared = await getMessages(lang, "shared/locale-switcher");

  return (
    <div className="flex flex-col gap-4" lang={lang}>
      <p className="text-brand text-xs font-semibold tracking-wide uppercase">
        Locale · <span data-testid="active-locale">{lang}</span>
      </p>
      <h2 className="text-2xl font-semibold" data-testid="i18n-title">
        {t.title}
      </h2>
      <p className="text-lg" data-testid="i18n-greeting">
        {t.greeting}
      </p>
      <p className="text-muted text-sm" data-testid="i18n-description">
        {t.description}
      </p>
      <LocaleSwitcher current={lang} label={shared.switchLabel} />
    </div>
  );
}

export default function I18nPage({
  params,
}: I18nPageProps) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <LocaleContent params={params} />
    </Suspense>
  );
}

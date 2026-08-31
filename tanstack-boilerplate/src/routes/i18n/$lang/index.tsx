// Ported from next-js-boilerplate/src/app/i18n/[lang]/page.tsx
// The per-locale dictionary is loaded by a server function; unsupported
// locales 404 (also rejected upstream by the request middleware).
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";
import { I18nPageFallback } from "@/fallbacks";
import { LocaleSwitcher } from "./-locale-switcher";

const getI18nPageData = createServerFn()
  .validator((input: { lang: string }) => input)
  .handler(async ({ data }) => {
    const [{ isLocale }, { getMessages }] = await Promise.all([
      import("@/lib/i18n/config"),
      import("@/lib/i18n/get-messages"),
    ]);
    if (!isLocale(data.lang)) throw notFound();
    return {
      lang: data.lang,
      t: getMessages(data.lang, "i18n"),
      shared: getMessages(data.lang, "shared/locale-switcher"),
    };
  });

export const Route = createFileRoute("/i18n/$lang/")({
  loader: ({ params }) => getI18nPageData({ data: { lang: params.lang } }),
  head: ({ loaderData }) => metadataToHead({ title: loaderData?.t.title }),
  pendingComponent: I18nPageFallback,
  component: I18nPage,
});

function I18nPage() {
  const { lang, t, shared } = Route.useLoaderData();

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

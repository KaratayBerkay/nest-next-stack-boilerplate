// i18n configuration shared by the server (dictionaries, pages) and the proxy
// (locale negotiation). Pure — no `server-only`, no React — so `proxy.ts` can
// import it in the middleware runtime.

import { LANGS, DEFAULT_LANG, type Lang } from "@/constants/i18n";

export type { Lang };
export { LANGS as locales, DEFAULT_LANG as defaultLocale };

export function isLocale(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/**
 * Minimal `Accept-Language` negotiation, per the Next.js i18n guide — but inline
 * instead of pulling `negotiator` + `@formatjs/intl-localematcher`, matching this
 * repo's "tiny helper over a dependency" pattern (cf. the inline CSP builder).
 *
 * Parses e.g. `"tr-TR,tr;q=0.9,en;q=0.8"`, ranks tags by their `q` weight, then
 * returns the first supported base language. Falls back to {@link defaultLocale}.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        tag: tag.toLowerCase(),
        quality: Number.isNaN(quality) ? 0 : quality,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LANG;
}

/** Resolve locale: cookie takes priority, fallback to Accept-Language. */
export function resolveLocale(
  langCookie: string | undefined,
  acceptLanguage: string | null | undefined,
): Lang {
  if (langCookie && isLocale(langCookie)) return langCookie;
  return matchLocale(acceptLanguage);
}

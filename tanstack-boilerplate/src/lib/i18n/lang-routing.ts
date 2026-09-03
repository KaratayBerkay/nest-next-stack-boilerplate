import { LANGS, LANG_COOKIE, type Lang } from "@/constants/i18n";

/**
 * The web app's real language switch is a cookie plus a navigation to the
 * same pathname under the other `/{lang}/` segment. These helpers are the
 * one implementation of that, shared by the header LangSwitcher and by
 * Settings → General, whose persisted `profile.locale` used to be written
 * to the backend and then never applied to the UI at all (CROSS-019).
 */

export function isLang(value: string | null | undefined): value is Lang {
  return (
    typeof value === "string" && (LANGS as readonly string[]).includes(value)
  );
}

export function setLangCookie(locale: Lang): void {
  document.cookie = `${LANG_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

/** Extract the locale segment from the pathname, if any. */
export function detectLang(pathname: string): Lang | null {
  const segs = pathname.split("/").filter(Boolean);
  for (const seg of segs) {
    if (isLang(seg)) return seg;
  }
  return null;
}

// fallow-ignore-next-line complexity
export function localizePathname(
  pathname: string,
  currentLang: string | null,
  target: Lang,
): string {
  if (currentLang && isLang(currentLang)) {
    const regex = new RegExp(`^/([^/]+/)${currentLang}(/|$)`);
    if (regex.test(pathname)) {
      return pathname.replace(regex, `/$1${target}$2`);
    }
    const regex2 = new RegExp(`^/${currentLang}(/|$)`);
    if (regex2.test(pathname)) {
      return pathname.replace(regex2, `/${target}$1`);
    }
  }
  return pathname;
}

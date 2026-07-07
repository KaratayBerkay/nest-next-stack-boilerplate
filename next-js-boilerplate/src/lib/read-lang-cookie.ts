import { LANG_COOKIE, LANGS, DEFAULT_LANG } from "@/constants/i18n";
import type { Lang } from "@/constants/i18n";

export function readLangCookie(): Lang {
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
  const val = match?.[1];
  if (val && (LANGS as readonly string[]).includes(val)) {
    return val as Lang;
  }
  return DEFAULT_LANG;
}

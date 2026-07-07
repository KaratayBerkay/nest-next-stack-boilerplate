export const LANGS = ["en", "tr"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "lang";
export const TIMEZONE_COOKIE = "tz";

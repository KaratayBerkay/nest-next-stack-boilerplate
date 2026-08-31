export const DATE_DISPLAY_FORMATS = ["long", "iso", "short"] as const;
export type DateDisplayFormat = (typeof DATE_DISPLAY_FORMATS)[number];
export const DEFAULT_DATE_DISPLAY: DateDisplayFormat = "long";
export const DATE_DISPLAY_COOKIE = "date_display";

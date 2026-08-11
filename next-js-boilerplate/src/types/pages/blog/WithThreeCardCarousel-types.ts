import type { I18nMessages } from "@/generated/i18n-messages";

export type BlogMessages = I18nMessages["pages"]["blog"];

type BlogStringKey = {
  [K in keyof BlogMessages]: BlogMessages[K] extends string ? K : never;
}[keyof BlogMessages];

export interface Blog41Slide {
  src: string;
  avatarSrc: string;
  titleKey: BlogStringKey;
  excerptKey: BlogStringKey;
  categoryKey: BlogStringKey;
  dateKey: BlogStringKey;
  authorKey: BlogStringKey;
}

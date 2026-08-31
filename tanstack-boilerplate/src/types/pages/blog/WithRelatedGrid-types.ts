import type { I18nMessages } from "@/generated/i18n-messages";

export type BlogMessages = I18nMessages["pages"]["blog"];

export type BlogStringKey = {
  [K in keyof BlogMessages]: BlogMessages[K] extends string ? K : never;
}[keyof BlogMessages];

export interface Blog19Post {
  categoryKey: BlogStringKey;
  titleKey: BlogStringKey;
  descriptionKey: BlogStringKey;
  dateKey: BlogStringKey;
}

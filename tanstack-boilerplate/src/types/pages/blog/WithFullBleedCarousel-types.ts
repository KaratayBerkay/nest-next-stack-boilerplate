import type { I18nMessages } from "@/generated/i18n-messages";

export type BlogMessages = I18nMessages["pages"]["blog"];

type BlogStringKey = {
  [K in keyof BlogMessages]: BlogMessages[K] extends string ? K : never;
}[keyof BlogMessages];

export interface Blog42Slide {
  src: string;
  titleKey: BlogStringKey;
  descriptionKey: BlogStringKey;
  categoryKey: BlogStringKey;
  dateKey: BlogStringKey;
}

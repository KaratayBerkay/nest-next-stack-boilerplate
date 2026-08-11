import type { I18nMessages } from "@/generated/i18n-messages";

export type BlogMessages = I18nMessages["pages"]["blog"];

export type BlogMessageKey = {
  [K in keyof BlogMessages]: BlogMessages[K] extends string ? K : never;
}[keyof BlogMessages];

export type Blog1Category = "design" | "engineering" | "product";

export interface Blog1Filter {
  value: string;
  labelKey: BlogMessageKey;
}

export interface Blog1Post {
  titleKey: BlogMessageKey;
  dateKey: BlogMessageKey;
  categoryKey: BlogMessageKey;
  categoryValue: Blog1Category;
  imageSeed: string;
}

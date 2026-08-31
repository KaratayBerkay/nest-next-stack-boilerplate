import type { I18nMessages } from "@/generated/i18n-messages";

export type BlogMessages = I18nMessages["pages"]["blog"];

export type BlogMessageKey = {
  [K in keyof BlogMessages]: BlogMessages[K] extends string ? K : never;
}[keyof BlogMessages];

export interface Blog12Post {
  titleKey: BlogMessageKey;
  summaryKey: BlogMessageKey;
  dateKey: BlogMessageKey;
  readMinutes: number;
  author: string;
  avatarSeed: string;
  imageSeed: string;
}

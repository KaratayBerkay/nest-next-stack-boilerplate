import type { I18nMessages } from "@/generated/i18n-messages";

export type BlogMessages = I18nMessages["pages"]["blog"];

export type BlogStringKey = {
  [K in keyof BlogMessages]: BlogMessages[K] extends string ? K : never;
}[keyof BlogMessages];

export interface Blog13Post {
  seed: string;
  ratio: number;
  categoryKey: BlogStringKey;
  titleKey: BlogStringKey;
  dateKey: BlogStringKey;
}

export interface Blog13PostCardProps {
  post: Blog13Post;
  t: BlogMessages;
}

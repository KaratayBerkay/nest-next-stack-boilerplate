import type { I18nMessages } from "@/generated/i18n-messages";

export type BlogMessages = I18nMessages["pages"]["blog"];

export type BlogStringKey = {
  [K in keyof BlogMessages]: BlogMessages[K] extends string ? K : never;
}[keyof BlogMessages];

export interface Blog23Post {
  seed: string;
  ratio: number;
  categoryKey: BlogStringKey;
  titleKey: BlogStringKey;
  summaryKey: BlogStringKey;
  authorKey: BlogStringKey;
  dateKey: BlogStringKey;
}

export interface Blog23PostCardProps {
  post: Blog23Post;
  t: BlogMessages;
}

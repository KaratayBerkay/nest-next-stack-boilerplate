import type { I18nMessages } from "@/generated/i18n-messages";

export interface FreePageViewDetailProps {
  t: I18nMessages["users"];
  params: Promise<{ lang: string; uuid: string }>;
  className?: string;
}

import type { I18nMessages } from "@/generated/i18n-messages";

export interface ClientLocaleProviderProps {
  defaultMessages: I18nMessages;
  children: React.ReactNode;
}

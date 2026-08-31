import type { I18nMessages } from "@/generated/i18n-messages";

export interface MessagesProviderProps {
  messages: I18nMessages;
  children: React.ReactNode;
}

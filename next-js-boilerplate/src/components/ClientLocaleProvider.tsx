"use client";

import { useEffect, useState } from "react";
import { MessagesProvider } from "@/lib/i18n/MessagesProvider";
import { LANG_COOKIE, LANGS, DEFAULT_LANG, type Lang } from "@/constants/i18n";
import type { I18nMessages } from "@/generated/i18n-messages";
import enMessages from "@/generated/i18n-messages-en.json";
import trMessages from "@/generated/i18n-messages-tr.json";

const LOCALE_MAP: Record<string, I18nMessages> = {
  en: enMessages as I18nMessages,
  tr: trMessages as I18nMessages,
};

export function ClientLocaleProvider({
  defaultMessages,
  children,
}: {
  defaultMessages: I18nMessages;
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState(defaultMessages);

  // fallow-ignore-next-line complexity
  useEffect(() => {
    const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
    const val = match?.[1];
    const lang: Lang =
      val && (LANGS as readonly string[]).includes(val)
        ? (val as Lang)
        : DEFAULT_LANG;
    const localeMessages = LOCALE_MAP[lang];
    if (localeMessages) {
      setMessages(localeMessages); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  return <MessagesProvider messages={messages}>{children}</MessagesProvider>;
}

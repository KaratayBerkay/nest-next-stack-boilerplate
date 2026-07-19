"use client";

import { createContext, useContext } from "react";
import type { I18nMessages } from "@/generated/i18n-messages";
import type { MessagesProviderProps } from "@/types/lib/MessagesProvider-types";

const MessagesContext = createContext<I18nMessages | null>(null);

export function MessagesProvider({
  messages,
  children,
}: MessagesProviderProps) {
  return (
    <MessagesContext.Provider value={messages}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages<P extends keyof I18nMessages>(
  page: P,
): I18nMessages[P] {
  const all = useContext(MessagesContext);
  const msgs = all?.[page];
  if (!msgs) {
    throw new Error(
      `Messages not found for page "${String(page)}". Is MessagesProvider mounted?`,
    );
  }
  return msgs as I18nMessages[P];
}

export function useAllMessages(): I18nMessages {
  const all = useContext(MessagesContext);
  if (!all) {
    throw new Error(
      "Messages not found. Is MessagesProvider mounted?",
    );
  }
  return all;
}

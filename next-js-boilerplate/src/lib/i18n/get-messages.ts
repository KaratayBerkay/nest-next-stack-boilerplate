import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Lang } from "@/constants/i18n";
import type { I18nMessages } from "@/generated/i18n-messages";

const messagesRoot = join(process.cwd(), "messages");

/**
 * Load typed messages for a given locale and page.
 *
 * ```ts
 * const t = getMessages(locale, "i18n");
 * t.title        // autocompleted: string
 * t.greeting     // autocompleted: string
 * ```
 *
 * Page names match the folder structure under `messages/{locale}/`:
 * - `"i18n"` → `messages/{locale}/i18n/messages.json`
 * - `"shared/locale-switcher"` → `messages/{locale}/shared/locale-switcher/messages.json`
 */
export function getMessages<P extends keyof I18nMessages>(
  locale: Lang,
  page: P,
): I18nMessages[P] {
  const file = join(messagesRoot, locale, page as string, "messages.json");
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as I18nMessages[P];
  } catch (cause) {
    throw new Error(
      `Failed to load i18n messages for locale="${locale}" page="${page}": ${cause instanceof Error ? cause.message : cause}`,
      { cause },
    );
  }
}

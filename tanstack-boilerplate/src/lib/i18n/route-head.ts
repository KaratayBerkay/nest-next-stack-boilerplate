// Localized page metadata for routes under /v1/$lang.
// The v1 layout route loader ships the full message tree for the active
// locale; page-level `head()` implementations pull their title/description
// keys out of that already-loaded data (isomorphic — no extra server call).

import type { I18nMessages } from "@/generated/i18n-messages";
import { metadataToHead } from "@/lib/head";

interface MatchLike {
  routeId: string;
  loaderData?: unknown;
}

export function v1MessagesFromMatches(
  matches: Array<MatchLike>,
): I18nMessages | undefined {
  for (const match of matches) {
    if (match.routeId === "/v1/$lang") {
      const data = match.loaderData as { messages?: I18nMessages } | undefined;
      return data?.messages;
    }
  }
  return undefined;
}

function pick(source: unknown, dottedPath: string): string | undefined {
  let current: unknown = source;
  for (const key of dottedPath.split(".")) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function v1PageHead(
  matches: Array<MatchLike>,
  page: keyof I18nMessages,
  titleKey: string,
  descriptionKey?: string,
): ReturnType<typeof metadataToHead> {
  const messages = v1MessagesFromMatches(matches);
  const section = messages?.[page];
  return metadataToHead({
    title: pick(section, titleKey),
    description: descriptionKey ? pick(section, descriptionKey) : undefined,
  });
}

/**
 * Link detection + click-safety policy for chat messages (DMs, chat rooms).
 *
 * Every http(s) URL found in a message body gets a card with a copy action;
 * whether the card is also CLICKABLE is a strict allow-policy decided here:
 * only https URLs pointing at what looks like a real public domain qualify.
 * Anything else — http, localhost, bare intranet hostnames, IP literals,
 * explicit ports, embedded credentials — renders as a non-clickable card so
 * the recipient can still copy the text but can't be one-click phished into
 * an internal or spoofed target.
 */

export interface DetectedLink {
  /** The URL exactly as it appeared in the message (trailing punctuation
   *  trimmed). */
  url: string;
  /** Passed the https + public-domain policy — safe to render as an <a>. */
  clickable: boolean;
}

/** At most this many link cards per message — a wall of URLs stays text. */
export const MAX_LINK_CARDS = 3;

const MAX_URL_LENGTH = 2048;

const URL_CANDIDATE_RE = /https?:\/\/[^\s<>"'`]+/gi;

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

/** TLDs that can never be public destinations (RFC 2606/6761/6762 special
 *  names plus common intranet conventions and Tor). */
const NON_PUBLIC_TLDS = new Set([
  "local",
  "localdomain",
  "localhost",
  "internal",
  "intranet",
  "lan",
  "home",
  "corp",
  "test",
  "invalid",
  "example",
  "onion",
]);

const TRAILING_PUNCTUATION = new Set([".", ",", "!", "?", ";", ":", "'", '"']);

const CLOSERS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

function countChar(s: string, c: string): number {
  let n = 0;
  for (const ch of s) if (ch === c) n++;
  return n;
}

/** Chat text wraps URLs in prose punctuation — "see https://a.b/c." or
 *  "(https://a.b/c)" — which the greedy matcher swallows. Trim trailing
 *  sentence punctuation always, and a trailing closer only when it has no
 *  matching opener inside the URL itself (so /path_(disambiguation) keeps
 *  its parenthesis). */
function trimTrailingPunctuation(raw: string): string {
  let url = raw;
  for (;;) {
    const last = url[url.length - 1];
    if (!last) return url;
    if (TRAILING_PUNCTUATION.has(last)) {
      url = url.slice(0, -1);
      continue;
    }
    const opener = CLOSERS[last];
    if (opener && countChar(url, last) > countChar(url, opener)) {
      url = url.slice(0, -1);
      continue;
    }
    return url;
  }
}

/** The click policy. Strict allow-list: https + a plausible public domain. */
export function isSafeExternalUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  // Credentials in the authority are a classic phishing shape
  // (https://trusted.com@evil.io/...).
  if (parsed.username !== "" || parsed.password !== "") return false;
  // Any explicit port (the URL parser already strips a default :443) reads
  // as a dev/internal service, localhost:3000-style — copyable, not
  // clickable.
  if (parsed.port !== "") return false;

  const host = parsed.hostname;
  if (host.startsWith("[") || host.includes(":")) return false; // IPv6 literal
  if (IPV4_RE.test(host)) return false;

  const labels = host.split(".");
  // No dot = bare hostname (intranet); empty label = malformed ("a..com").
  if (labels.length < 2 || labels.some((l) => l.length === 0)) return false;

  const tld = labels[labels.length - 1];
  if (NON_PUBLIC_TLDS.has(tld)) return false;
  // Real TLDs are alphabetic (or punycode xn--…), at least 2 chars.
  if (!/^(?:[a-z]{2,}|xn--[a-z0-9-]{2,})$/.test(tld)) return false;

  return true;
}

/** Finds up to MAX_LINK_CARDS distinct http(s) URLs in a message body and
 *  classifies each against the click policy. */
export function extractLinks(text: string): DetectedLink[] {
  const links: DetectedLink[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(URL_CANDIDATE_RE)) {
    const url = trimTrailingPunctuation(match[0]);
    if (url.length > MAX_URL_LENGTH || seen.has(url)) continue;
    seen.add(url);
    links.push({ url, clickable: isSafeExternalUrl(url) });
    if (links.length >= MAX_LINK_CARDS) break;
  }
  return links;
}

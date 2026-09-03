// CROSS-019: the profile's IANA timezone, mirrored into a cookie so the
// date formatters (plain functions, no React context) can read it
// synchronously on the client — same pattern as the lang / date_display /
// currency preference cookies.
export const TIMEZONE_COOKIE = "timezone";

const validityCache = new Map<string, boolean>();

/** True when Intl knows the zone (guards against a stale/garbage cookie). */
export function isValidTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  const cached = validityCache.get(tz);
  if (cached !== undefined) return cached;
  let ok = false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    ok = true;
  } catch {
    ok = false;
  }
  validityCache.set(tz, ok);
  return ok;
}

/** Client-only: the preferred zone from the cookie, or null when unset/invalid. */
export function readTimezoneCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TIMEZONE_COOKIE}=([^;]+)`),
  );
  const raw = match?.[1] ? decodeURIComponent(match[1]) : null;
  return isValidTimeZone(raw) ? raw : null;
}

export function setTimezoneCookie(tz: string | null | undefined): void {
  if (typeof document === "undefined") return;
  if (!isValidTimeZone(tz)) {
    document.cookie = `${TIMEZONE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return;
  }
  document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

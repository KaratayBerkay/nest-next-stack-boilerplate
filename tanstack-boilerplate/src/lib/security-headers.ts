// Global security headers for every page/document response — the tanstack
// twin of next-js-boilerplate's next.config.ts `headers()` rules. There is no
// next.config here, so start.ts's request middleware applies these instead.
// Scope note: that middleware deliberately skips /api/* and /_serverFn, so
// BFF routes that serve non-JSON user bytes must set their own headers — see
// bff/upload/serve/route.ts, which mirrors next.config's per-path override.

export const STATIC_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "connect-src 'self' ws: wss: https: https://*.stripe.com",
  "frame-src 'self' https://*.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const GLOBAL_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Content-Security-Policy": STATIC_CSP,
};

// The blanket camera=()/microphone=() above blocks getUserMedia() everywhere,
// including RTC — calls/meetings/streaming need both, plus display-capture
// for meeting screen-share (same carve-out as next.config.ts).
const RTC_PATH_RE = /^\/v1\/[^/]+\/rtc(\/|$)/;

export function securityHeadersFor(pathname: string): Record<string, string> {
  const headers = { ...GLOBAL_HEADERS };
  if (RTC_PATH_RE.test(pathname)) {
    headers["Permissions-Policy"] =
      "camera=(self), microphone=(self), display-capture=(self)";
  }
  return headers;
}

// Shape-check for the `[provider]` dynamic route segment used by
// /api/auth/oauth/[provider] and its callback. Next.js decodeURIComponent's
// dynamic segments before handing them to the route, so a percent-encoded
// control character (e.g. `%0D%0A`) survives normal URL parsing and reaches
// route code as a real CR/LF — which then gets interpolated straight into a
// cookie `path` and the backend OAuth URL. The cookie serializer rejects
// those bytes (good), but nothing catches the throw, so an unvalidated
// segment turns into an unhandled 500 instead of a clean 400.
//
// Real provider keys (nest-js-boilerplate's oauth-providers.ts) are always
// lowercase ASCII slugs — gate on that shape rather than hardcoding the
// provider list here, so a new backend provider doesn't need a matching
// frontend allowlist update.
const OAUTH_PROVIDER_RE = /^[a-z][a-z0-9-]{0,31}$/;

export function isValidOAuthProviderName(provider: string): boolean {
  return OAUTH_PROVIDER_RE.test(provider);
}

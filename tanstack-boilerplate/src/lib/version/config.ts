// Version configuration shared by the server (pages) and the proxy (version
// gating + redirects). Pure — no `server-only`, no React — so `proxy.ts` can
// import it in the middleware runtime. Mirrors src/lib/i18n/config.ts.

export const versions = ["v1"] as const;
export type Version = (typeof versions)[number];
export const defaultVersion: Version = "v1";

export function isVersion(value: string): value is Version {
  return (versions as readonly string[]).includes(value);
}

// A path segment that *looks* like a version (v1, v2, v10…) even when we don't
// support it. The proxy uses this to recognise a versioned URL so it can redirect
// an unknown version to {@link defaultVersion} instead of letting it 404.
export function isVersionLike(value: string): boolean {
  return /^v\d+$/.test(value);
}

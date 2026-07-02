import { describe, it, expect } from "vitest";
import { matchLocale, resolveLocale, defaultLocale } from "./config";

describe("matchLocale (Accept-Language negotiation)", () => {
  it("returns the default locale when the header is absent or empty", () => {
    expect(matchLocale(null)).toBe(defaultLocale);
    expect(matchLocale(undefined)).toBe(defaultLocale);
    expect(matchLocale("")).toBe(defaultLocale);
  });

  it("matches a supported base language from a regional tag (tr-TR → tr)", () => {
    expect(matchLocale("tr-TR,tr;q=0.9,en;q=0.8")).toBe("tr");
  });

  it("honors quality weight over listing order", () => {
    expect(matchLocale("en;q=0.5,tr;q=0.9")).toBe("tr");
  });

  it("skips unsupported languages and picks the next supported one", () => {
    expect(matchLocale("fr-FR,fr;q=0.9,tr;q=0.4")).toBe("tr");
  });

  it("falls back to the default when nothing is supported", () => {
    expect(matchLocale("fr-FR,es;q=0.9")).toBe(defaultLocale);
  });

  it("excludes q=0 entries (not acceptable per RFC 9110)", () => {
    expect(matchLocale("en;q=0,tr;q=0.9")).toBe("tr");
    expect(matchLocale("en;q=0,fr;q=0,de;q=0")).toBe(defaultLocale);
  });
});

describe("resolveLocale (cookie-first, fallback to Accept-Language)", () => {
  it("returns the cookie value when valid", () => {
    expect(resolveLocale("tr", "en;q=1")).toBe("tr");
    expect(resolveLocale("en", "tr;q=1")).toBe("en");
  });

  it("ignores invalid cookie and falls back to Accept-Language", () => {
    expect(resolveLocale("fr", "tr;q=0.9,en;q=0.5")).toBe("tr");
    expect(resolveLocale("", "en;q=1")).toBe("en");
  });

  it("falls back to default when both cookie and header are missing", () => {
    expect(resolveLocale(undefined, null)).toBe(defaultLocale);
    expect(resolveLocale(undefined, undefined)).toBe(defaultLocale);
  });
});

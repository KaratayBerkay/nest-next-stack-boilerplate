import { describe, it, expect } from "vitest";
import { detectLang, isLang, localizePathname } from "@/lib/i18n/lang-routing";

describe("lang-routing", () => {
  it("detects the locale segment anywhere in the path", () => {
    expect(detectLang("/v1/en/settings/general")).toBe("en");
    expect(detectLang("/tr/pricing")).toBe("tr");
    expect(detectLang("/about")).toBeNull();
  });

  it("only accepts configured languages", () => {
    expect(isLang("en")).toBe(true);
    expect(isLang("tr")).toBe(true);
    expect(isLang("de")).toBe(false);
    expect(isLang(null)).toBe(false);
  });

  it("swaps the /{prefix}/{lang}/ segment and the leading /{lang}/ segment", () => {
    expect(localizePathname("/v1/en/settings/general", "en", "tr")).toBe(
      "/v1/tr/settings/general",
    );
    expect(localizePathname("/en/pricing", "en", "tr")).toBe("/tr/pricing");
    expect(localizePathname("/v1/en", "en", "tr")).toBe("/v1/tr");
  });

  it("leaves a path without a language segment untouched", () => {
    expect(localizePathname("/about", null, "tr")).toBe("/about");
  });
});

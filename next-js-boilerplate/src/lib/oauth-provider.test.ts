import { describe, it, expect } from "vitest";
import { isValidOAuthProviderName } from "./oauth-provider";

describe("isValidOAuthProviderName", () => {
  it("accepts every real backend provider slug", () => {
    for (const p of [
      "google",
      "github",
      "x",
      "linkedin",
      "huggingface",
      "twitch",
    ]) {
      expect(isValidOAuthProviderName(p)).toBe(true);
    }
  });

  it("rejects a CRLF-smuggling segment (the cookie-path injection attempt)", () => {
    expect(isValidOAuthProviderName("google\r\nSet-Cookie: evil=1")).toBe(
      false,
    );
  });

  it("rejects a path-traversal-shaped segment", () => {
    expect(isValidOAuthProviderName("../../etc/passwd")).toBe(false);
    expect(isValidOAuthProviderName("google/callback")).toBe(false);
  });

  it("rejects empty, oversized, and non-lowercase input", () => {
    expect(isValidOAuthProviderName("")).toBe(false);
    expect(isValidOAuthProviderName("a".repeat(33))).toBe(false);
    expect(isValidOAuthProviderName("Google")).toBe(false);
    expect(isValidOAuthProviderName("GOOGLE")).toBe(false);
  });

  it("rejects a leading digit or hyphen", () => {
    expect(isValidOAuthProviderName("1google")).toBe(false);
    expect(isValidOAuthProviderName("-google")).toBe(false);
  });
});

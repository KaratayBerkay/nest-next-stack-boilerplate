import { describe, it, expect } from "vitest";
import { truncate } from "../PostContent";

describe("truncate", () => {
  it("keeps a surrogate-pair character (emoji) intact instead of splitting it mid-character", () => {
    const text = "abcd😀!!!!!!";
    const result = truncate(text, 5);

    expect(result).toBe("abcd😀...");
    expect(result).toContain("😀");
    // Proves this text actually exercises the bug: a naive UTF-16 slice at
    // the same cut point breaks the emoji into an unpaired surrogate.
    expect(text.slice(0, 5)).not.toContain("😀");
  });

  it("returns the original text unchanged when under the limit", () => {
    expect(truncate("short", 200)).toBe("short");
  });

  it("truncates plain ASCII text normally", () => {
    expect(truncate("a".repeat(210), 200)).toBe(`${"a".repeat(200)}...`);
  });
});

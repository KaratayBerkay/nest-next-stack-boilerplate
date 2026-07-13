import { describe, it, expect } from "vitest";
import { resolveVariant } from "@/lib/resolve-variant";

const map = {
  default: "bg-surface text-fg",
  primary: "bg-brand text-brand-fg",
  secondary: "bg-surface text-fg",
} as const;

describe("resolveVariant", () => {
  it("returns the matching variant class string", () => {
    expect(resolveVariant(map, "primary")).toBe("bg-brand text-brand-fg");
  });

  it("returns default when key is undefined", () => {
    expect(resolveVariant(map, undefined)).toBe("bg-surface text-fg");
  });

  it("returns default when key is not in the map", () => {
    expect(resolveVariant(map, "neon")).toBe("bg-surface text-fg");
  });

  it("returns default when key is empty string", () => {
    expect(resolveVariant(map, "")).toBe("bg-surface text-fg");
  });

  it("returns default when key is an empty string", () => {
    expect(resolveVariant(map, "glass")).toBe("bg-surface text-fg");
  });

  it("works with a map that has a matching key", () => {
    expect(resolveVariant(map, "secondary")).toBe("bg-surface text-fg");
  });
});

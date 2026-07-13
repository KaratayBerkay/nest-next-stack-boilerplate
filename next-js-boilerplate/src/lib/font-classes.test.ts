import { describe, it, expect } from "vitest";
import { fontClasses } from "@/lib/font-classes";

describe("fontClasses", () => {
  it("returns default classes when no props or defaults provided", () => {
    expect(fontClasses({})).toBe("text-sm font-medium font-sans");
  });

  it("uses provided props over defaults", () => {
    expect(
      fontClasses(
        { fontSize: "text-lg", fontWeight: "font-bold", fontFamily: "font-mono" },
      ),
    ).toBe("text-lg font-bold font-mono");
  });

  it("uses custom defaults when no props provided", () => {
    expect(
      fontClasses(
        {},
        { fontSize: "text-xs", fontWeight: "font-normal", fontFamily: "font-mono" },
      ),
    ).toBe("text-xs font-normal font-mono");
  });

  it("props take precedence over custom defaults", () => {
    expect(
      fontClasses(
        { fontSize: "text-lg" },
        { fontSize: "text-xs", fontWeight: "font-normal" },
      ),
    ).toBe("text-lg font-normal font-sans");
  });

  it("handles partial props", () => {
    expect(fontClasses({ fontWeight: "font-bold" })).toBe(
      "text-sm font-bold font-sans",
    );
  });
});

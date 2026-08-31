import { describe, it, expect } from "vitest";
import { sanitizeFieldName } from "./FormBuilder-utils";

describe("sanitizeFieldName", () => {
  it("strips non-alphanumeric characters from the label", () => {
    expect(sanitizeFieldName("Full Name!")).toBe("FullName");
  });

  it("returns a distinct name when the sanitized result collides with an existing one", () => {
    const name = sanitizeFieldName("New Field", ["NewField"]);
    expect(name).toBe("NewField2");
  });

  it("keeps incrementing the suffix until a free name is found", () => {
    const name = sanitizeFieldName("New Field", [
      "NewField",
      "NewField2",
      "NewField3",
    ]);
    expect(name).toBe("NewField4");
  });

  it("returns the plain sanitized name when there is no collision", () => {
    expect(sanitizeFieldName("Email", ["FullName"])).toBe("Email");
  });

  it("falls back to a random name for a reserved word, still checked for collisions", () => {
    const name = sanitizeFieldName("constructor");
    expect(name).not.toBe("constructor");
    expect(name).toMatch(/^field_/);
  });
});

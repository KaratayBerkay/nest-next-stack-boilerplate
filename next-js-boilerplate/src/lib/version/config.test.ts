import { describe, it, expect } from "vitest";
import { defaultVersion, isVersion, isVersionLike, versions } from "./config";

describe("version config", () => {
  it("includes the default version in the supported list", () => {
    expect(versions).toContain(defaultVersion);
  });

  it("isVersion recognises supported versions only", () => {
    expect(isVersion("v1")).toBe(true);
    expect(isVersion("v2")).toBe(false);
    expect(isVersion("en")).toBe(false);
  });

  it("isVersionLike matches a version-shaped segment regardless of support", () => {
    expect(isVersionLike("v1")).toBe(true);
    expect(isVersionLike("v2")).toBe(true);
    expect(isVersionLike("v10")).toBe(true);
  });

  it("isVersionLike rejects non-version segments", () => {
    expect(isVersionLike("en")).toBe(false);
    expect(isVersionLike("version1")).toBe(false);
    expect(isVersionLike("v")).toBe(false);
    expect(isVersionLike("1")).toBe(false);
  });
});

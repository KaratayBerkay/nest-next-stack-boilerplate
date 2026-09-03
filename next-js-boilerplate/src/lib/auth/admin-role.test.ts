import { describe, it, expect } from "vitest";
import { isAdminRole } from "./admin-role";

describe("isAdminRole", () => {
  it("accepts only ADMIN and SUPERADMIN", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("SUPERADMIN")).toBe(true);
    expect(isAdminRole("USER")).toBe(false);
    expect(isAdminRole("admin")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});

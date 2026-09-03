import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const getSessionUser = vi.fn();
vi.mock("@/lib/auth-ssr", () => ({
  getSessionUser: () => getSessionUser(),
}));
vi.mock("@/lib/i18n/get-messages", () => ({
  getMessages: () => ({ accessDenied: "DENIED" }),
}));
vi.mock("@/features/statics", () => ({
  AccessDeniedPage: ({ message }: { message: string }) => <div>{message}</div>,
}));

import AdminLayout from "./layout";

const renderLayout = async () =>
  render(
    await AdminLayout({
      children: <div>ADMIN_TREE</div>,
      params: Promise.resolve({ lang: "en" }),
    }),
  );

// CROSS-039: the role check used to live only in the client PageContent.
describe("AdminLayout server-side role gate", () => {
  beforeEach(() => getSessionUser.mockReset());

  it("renders the denial instead of the admin tree for a non-admin session", async () => {
    getSessionUser.mockResolvedValue({ id: "u1", role: "USER" });
    await renderLayout();
    expect(screen.getByText("DENIED")).toBeTruthy();
    expect(screen.queryByText("ADMIN_TREE")).toBeNull();
  });

  it("treats a missing session as denied", async () => {
    getSessionUser.mockResolvedValue(null);
    await renderLayout();
    expect(screen.getByText("DENIED")).toBeTruthy();
  });

  it("renders the admin tree for ADMIN and SUPERADMIN", async () => {
    for (const role of ["ADMIN", "SUPERADMIN"]) {
      getSessionUser.mockResolvedValue({ id: "u1", role });
      const { unmount } = await renderLayout();
      expect(screen.getByText("ADMIN_TREE")).toBeTruthy();
      unmount();
    }
  });
});

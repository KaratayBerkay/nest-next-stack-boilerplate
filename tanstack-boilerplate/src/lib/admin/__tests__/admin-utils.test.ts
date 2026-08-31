import { describe, it, expect, vi } from "vitest";
import { setTier, setUserStatus, resetUserMfa } from "../admin-utils";
import type { I18nMessages } from "@/generated/i18n-messages";

const setTierServerMock = vi.fn();
const setStatusServerMock = vi.fn();
const resetMfaServerMock = vi.fn();

vi.mock("@/api/server/admin/set-tier", () => ({
  setTierServer: (...args: unknown[]) => setTierServerMock(...args),
}));
vi.mock("@/api/server/admin/set-status", () => ({
  setStatusServer: (...args: unknown[]) => setStatusServerMock(...args),
}));
vi.mock("@/api/server/admin/reset-mfa", () => ({
  resetMfaServer: (...args: unknown[]) => resetMfaServerMock(...args),
}));

const t = {
  tierUpdated: "TIER_UPDATED",
  tierUpdateFailed: "TIER_UPDATE_FAILED",
  statusUpdated: "STATUS_UPDATED",
  statusUpdateFailed: "STATUS_UPDATE_FAILED",
  mfaResetSuccess: "MFA_RESET_SUCCESS",
  mfaResetFailed: "MFA_RESET_FAILED",
  networkError: "NETWORK_ERROR",
  notPermittedForUser: "NOT_PERMITTED",
} as unknown as I18nMessages["admin"];

describe("setTier", () => {
  it("shows the real backend message when one is provided", async () => {
    setTierServerMock.mockResolvedValue({
      success: false,
      error: "Tier is already at that value",
    });
    const setStatusMsg = vi.fn();

    await setTier("u1", "BASIC", setStatusMsg, vi.fn(), t);

    expect(setStatusMsg).toHaveBeenCalledWith({
      type: "error",
      text: "Tier is already at that value",
    });
  });

  it("falls back to the translated generic failure message when the backend gives none", async () => {
    setTierServerMock.mockResolvedValue({ success: false });
    const setStatusMsg = vi.fn();

    await setTier("u1", "BASIC", setStatusMsg, vi.fn(), t);

    expect(setStatusMsg).toHaveBeenCalledWith({
      type: "error",
      text: t.tierUpdateFailed,
    });
  });

  it("shows a translated not-permitted message instead of the generic failure when the role-hierarchy check denies it", async () => {
    setTierServerMock.mockResolvedValue({ success: false, notPermitted: true });
    const setStatusMsg = vi.fn();

    await setTier("u1", "BASIC", setStatusMsg, vi.fn(), t);

    expect(setStatusMsg).toHaveBeenCalledWith({
      type: "error",
      text: t.notPermittedForUser,
    });
  });
});

describe("setUserStatus", () => {
  it("shows a translated not-permitted message when denied", async () => {
    setStatusServerMock.mockResolvedValue({
      success: false,
      notPermitted: true,
    });
    const setStatusMsg = vi.fn();

    await setUserStatus("u1", "BANNED", setStatusMsg, vi.fn(), t);

    expect(setStatusMsg).toHaveBeenCalledWith({
      type: "error",
      text: t.notPermittedForUser,
    });
  });
});

describe("resetUserMfa", () => {
  it("shows a translated not-permitted message when denied", async () => {
    resetMfaServerMock.mockResolvedValue({
      success: false,
      notPermitted: true,
    });
    const setStatusMsg = vi.fn();

    await resetUserMfa("u1", setStatusMsg, t);

    expect(setStatusMsg).toHaveBeenCalledWith({
      type: "error",
      text: t.notPermittedForUser,
    });
  });
});

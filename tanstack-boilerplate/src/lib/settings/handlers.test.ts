import { describe, it, expect, vi } from "vitest";
import { saveSettings } from "@/lib/settings/handlers";

describe("saveSettings", () => {
  it("never sends name — this page has no name field and the backend rejects an empty string", async () => {
    const updateProfile = vi.fn().mockResolvedValue(undefined);
    const setSaving = vi.fn();
    const toast = vi.fn().mockReturnValue("toast-id");
    const refreshUser = vi.fn().mockResolvedValue(undefined);

    await saveSettings(
      setSaving,
      "en",
      "UTC",
      toast,
      "Saved",
      "Failed",
      refreshUser,
      updateProfile,
    );

    expect(updateProfile).toHaveBeenCalledWith({
      locale: "en",
      timezone: "UTC",
    });
    expect(updateProfile).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.anything() as unknown }),
    );
    expect(toast).toHaveBeenCalledWith({ title: "Saved", variant: "success" });
  });

  it("shows the backend's own message on failure, falling back to the generic one", async () => {
    const updateProfile = vi.fn().mockRejectedValue(
      Object.assign(new Error("failed"), {
        exception: { msg: "Locale not supported" },
      }),
    );
    const toast = vi.fn().mockReturnValue("toast-id");

    await saveSettings(
      vi.fn(),
      "en",
      "UTC",
      toast,
      "Saved",
      "Failed",
      vi.fn(),
      updateProfile,
    );

    expect(toast).toHaveBeenCalledWith({
      title: "Locale not supported",
      variant: "destructive",
    });
  });
});

// CROSS-019: the persisted locale must actually switch the UI language —
// saveSettings hands the saved value to the page's applyLocale after the
// profile write and refresh succeed, and never after a failed save.
describe("saveSettings — applying the saved language", () => {
  it("calls applyLocale with the saved locale after a successful save", async () => {
    const applyLocale = vi.fn();
    const refreshUser = vi.fn().mockResolvedValue(undefined);

    await saveSettings(
      vi.fn(),
      "tr",
      "Europe/Istanbul",
      vi.fn().mockReturnValue("toast-id"),
      "Saved",
      "Failed",
      refreshUser,
      vi.fn().mockResolvedValue(undefined),
      applyLocale,
    );

    expect(applyLocale).toHaveBeenCalledWith("tr");
    // The session snapshot is refreshed first, so the navigated-to page
    // already renders against the new profile.
    expect(refreshUser.mock.invocationCallOrder[0]).toBeLessThan(
      applyLocale.mock.invocationCallOrder[0],
    );
  });

  it("does not apply the locale when the save failed", async () => {
    const applyLocale = vi.fn();

    await saveSettings(
      vi.fn(),
      "tr",
      "UTC",
      vi.fn().mockReturnValue("toast-id"),
      "Saved",
      "Failed",
      vi.fn(),
      vi.fn().mockRejectedValue(new Error("nope")),
      applyLocale,
    );

    expect(applyLocale).not.toHaveBeenCalled();
  });
});

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

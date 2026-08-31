import { describe, it, expect, vi } from "vitest";
import { uploadAvatarFile } from "./profile-actions";

const t = {
  invalidFileType: "INVALID_TYPE",
  fileTooLarge: "TOO_LARGE",
  uploadFailed: "UPLOAD_FAILED",
};

describe("uploadAvatarFile", () => {
  it("accepts an AVIF avatar instead of rejecting it as an unsupported type", async () => {
    const toast = vi.fn();
    const setAvatarUrl = vi.fn();
    const uploadAvatar = vi
      .fn()
      .mockResolvedValue({ urls: { full: "https://cdn.example.com/a.avif" } });
    const file = new File(["x"], "avatar.avif", { type: "image/avif" });

    await uploadAvatarFile(file, toast, t, setAvatarUrl, uploadAvatar);

    expect(toast).not.toHaveBeenCalled();
    expect(uploadAvatar).toHaveBeenCalledWith(file);
    expect(setAvatarUrl).toHaveBeenCalledWith("https://cdn.example.com/a.avif");
  });

  it("still rejects a genuinely unsupported type", async () => {
    const toast = vi.fn();
    const setAvatarUrl = vi.fn();
    const uploadAvatar = vi.fn();
    const file = new File(["x"], "clip.mp4", { type: "video/mp4" });

    await uploadAvatarFile(file, toast, t, setAvatarUrl, uploadAvatar);

    expect(toast).toHaveBeenCalledWith({
      title: "INVALID_TYPE",
      variant: "destructive",
    });
    expect(uploadAvatar).not.toHaveBeenCalled();
  });
});

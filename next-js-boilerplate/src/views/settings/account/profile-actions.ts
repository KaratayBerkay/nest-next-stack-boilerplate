import type { Dispatch, SetStateAction } from "react";
import type { useToast } from "@/components/ui/Toast";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

export async function uploadAvatarFile(
  file: File,
  toast: ReturnType<typeof useToast>["toast"],
  t: Record<string, string>,
  setAvatarUrl: Dispatch<SetStateAction<string>>,
  uploadAvatar: (file: File) => Promise<{ urls: { full: string } }>,
) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    toast({ title: t.invalidFileType, variant: "destructive" });
    return;
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    toast({ title: t.fileTooLarge, variant: "destructive" });
    return;
  }
  try {
    const uploadRes = await uploadAvatar(file);
    setAvatarUrl(uploadRes.urls.full);
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({ title: exception?.msg ?? t.uploadFailed, variant: "destructive" });
  }
}

export async function handleSaveProfile(deps: {
  name: string;
  username: string | undefined;
  bio: string;
  avatarUrl: string | undefined;
  toast: ReturnType<typeof useToast>["toast"];
  t: { saveSuccess: string; saveFailed: string };
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    name: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  setSaving: Dispatch<SetStateAction<boolean>>;
}) {
  deps.setSaving(true);
  try {
    await deps.updateProfile({
      name: deps.name,
      username: deps.username,
      bio: deps.bio,
      avatarUrl: deps.avatarUrl,
    });
    deps.toast({ title: deps.t.saveSuccess, variant: "success" });
    await deps.refreshUser();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    deps.toast({
      title: exception?.msg ?? deps.t.saveFailed,
      variant: "destructive",
    });
  } finally {
    deps.setSaving(false);
  }
}

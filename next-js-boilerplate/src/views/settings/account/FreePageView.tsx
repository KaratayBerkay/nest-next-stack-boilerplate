"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsAccountPageInfo } from "@/constants/page-info";
import { useProfileActions } from "@/api/client/profile/actions";

async function uploadAvatarFile(
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
  if (file.size > 5 * 1024 * 1024) {
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

async function handleSaveProfile(deps: {
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
    deps.toast({ title: exception?.msg ?? deps.t.saveFailed, variant: "destructive" });
  } finally {
    deps.setSaving(false);
  }
}

export function FreePageView() {
  const { user, loading, refreshUser } = useAuth();
  const t = useMessages("settings");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfile, uploadAvatar, checkUsername } = useProfileActions();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const profileLoadedRef = useRef(false);

  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || profileLoadedRef.current) return;
    profileLoadedRef.current = true;
    (async () => {
      try {
        const { getProfileServer } = await import("@/api/server/profile/get");
        const data = await getProfileServer();
        const p = data.user;
        setName(p.name ?? "");
        setUsername(p.username ?? "");
        setBio(p.bio ?? "");
        setAvatarUrl(p.avatarUrl ?? "");
      } catch {
        /* silent */
      }
    })();
  }, [user]);

  const checkTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevUsername = useRef(username);

  useEffect(() => {
    if (prevUsername.current === username) return;
    prevUsername.current = username;
    if (!username || username === (user?.username ?? "") || username.length < 3)
      return;
    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(() => {
      setAvailability("checking");
      checkUsername(username)
        .then((available) => setAvailability(available ? "available" : "taken"))
        .catch(() => setAvailability("taken"));
    }, 300);
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, [username, user?.username, checkUsername]);

  const handleAvatarFile = useCallback(
    (file: File) => uploadAvatarFile(file, toast, t as unknown as Record<string, string>, setAvatarUrl, uploadAvatar),
    [toast, t, uploadAvatar],
  );

  const saveProfile = useCallback(
    () => handleSaveProfile({
      name, username: username || undefined, bio, avatarUrl: avatarUrl || undefined,
      toast, t, refreshUser, updateProfile, setSaving,
    }),
    [name, username, bio, avatarUrl, toast, t, refreshUser, updateProfile],
  );

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageAccount} />;

  const canSave =
    !saving && availability !== "checking" && availability !== "taken";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.accountHeading}</h2>
        <PageInfoButton content={settingsAccountPageInfo} />
      </div>

      <div className="flex items-center gap-4">
        <Avatar
          src={avatarUrl}
          fallback={initials(name || user.email)}
          size="xl"
          className="bg-brand text-white"
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="link"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            {t.avatarChange}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarFile(file);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t.name}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t.username}</Label>
          <Input
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
              )
            }
          />
          {availability === "checking" && (
            <span className="text-muted text-xs">{t.usernameChecking}</span>
          )}
          {availability === "available" && (
            <span className="text-xs text-green-600">
              {t.usernameAvailable}
            </span>
          )}
          {availability === "taken" && (
            <span className="text-xs text-red-600">{t.usernameTaken}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t.bio}</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <Button
        onClick={saveProfile}
        disabled={!canSave}
        variant="primary"
        className="self-start"
      >
        {saving ? t.saving : t.save}
      </Button>
    </div>
  );
}

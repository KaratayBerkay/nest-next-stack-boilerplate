"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsAccountPageInfo } from "@/constants/page-info";
import { useProfileActions } from "@/api/client/profile/actions";
import { cn } from "@/lib/cn";
import type { ClassNameProps } from "@/types/ui/ClassName-types";
import { uploadAvatarFile, handleSaveProfile } from "./profile-actions";
import { AccountAvatarSection } from "./AccountAvatarSection";
import { AccountFormFields } from "./AccountFormFields";

export function FreePageView({ className }: ClassNameProps) {
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
    (file: File) =>
      uploadAvatarFile(
        file,
        toast,
        t as unknown as Record<string, string>,
        setAvatarUrl,
        uploadAvatar,
      ),
    [toast, t, uploadAvatar],
  );

  const saveProfile = useCallback(
    () =>
      handleSaveProfile({
        name,
        username: username || undefined,
        bio,
        avatarUrl: avatarUrl || undefined,
        toast,
        t,
        refreshUser,
        updateProfile,
        setSaving,
      }),
    [name, username, bio, avatarUrl, toast, t, refreshUser, updateProfile],
  );

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageAccount} />;

  const canSave =
    !saving && availability !== "checking" && availability !== "taken";

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.accountHeading}
        actions={<PageInfoButton content={settingsAccountPageInfo} />}
      />

      <AccountAvatarSection
        avatarUrl={avatarUrl}
        name={name}
        email={user.email}
        fileInputRef={fileInputRef}
        onFileSelect={handleAvatarFile}
        t={t}
      />

      <AccountFormFields
        name={name}
        onNameChange={setName}
        username={username}
        onUsernameChange={setUsername}
        bio={bio}
        onBioChange={setBio}
        availability={availability}
        t={t}
      />

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

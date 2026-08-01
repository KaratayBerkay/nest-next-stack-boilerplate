"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ClassNameProps } from "@/types/ui/ClassName-types";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsPrivacyPageInfo } from "@/constants/page-info";
import { useProfileActions } from "@/api/client/profile/actions";
import { PrivacyToggleRow } from "./PrivacyToggleRow";

async function handleSave(
  updateProfile: (data: { chatNickname?: string | null }) => Promise<void>,
  refreshUser: () => Promise<void>,
  toast: ReturnType<typeof useToast>["toast"],
  t: { saveSuccess: string; saveFailed: string },
  useNickname: boolean,
  nickname: string,
) {
  try {
    await updateProfile({
      chatNickname: useNickname && nickname.trim() ? nickname.trim() : null,
    });
    // Re-seed the page (and the SSR session_user snapshot) from the server —
    // without this, the saved nickname/toggle show stale values until next
    // login, the exact bug class this page originally reported.
    await refreshUser();
    toast({ title: t.saveSuccess, variant: "success" });
  } catch {
    toast({ title: t.saveFailed, variant: "destructive" });
  }
}

export function FreePageView({ className }: ClassNameProps) {
  const params = useParams<{ lang: string }>();
  const t = useMessages("settings");
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const { updateProfile } = useProfileActions();

  const [hideProfilePicture, setHideProfilePicture] = useState(false);
  const [useNickname, setUseNickname] = useState(!!user?.chatNickname);
  const [nickname, setNickname] = useState(user?.chatNickname ?? "");

  // `user` can populate/update after this component's first render (SSR
  // hydration timing, or `refreshUser()` elsewhere) — the useState
  // initializers above only run once at mount, so without this re-sync the
  // toggle and field silently fall out of sync with the actual saved value
  // on any reload where `user` wasn't already populated at first paint.
  // Adjusting state during render (React's documented pattern for this,
  // not an effect) instead of useEffect, to stay clean of this codebase's
  // set-state-in-effect lint rule.
  const [seededNickname, setSeededNickname] = useState(user?.chatNickname);
  if (user?.chatNickname !== seededNickname) {
    setSeededNickname(user?.chatNickname);
    setUseNickname(!!user?.chatNickname);
    setNickname(user?.chatNickname ?? "");
  }

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.privacyHeading}
        actions={<PageInfoButton content={settingsPrivacyPageInfo} />}
      />

      <div className="flex flex-col gap-4">
        <PrivacyToggleRow
          title={t.privacyHideProfilePicture}
          description={t.privacyHideProfilePictureDesc}
          checked={hideProfilePicture}
          onChange={setHideProfilePicture}
        />

        <PrivacyToggleRow
          title={t.privacyNickname}
          description={t.privacyNicknameDesc}
          checked={useNickname}
          onChange={setUseNickname}
        >
          {user?.chatNickname && (
            <p className="text-muted mt-3 text-xs">
              {t.privacyNicknameCurrent}:{" "}
              <span className="text-fg font-medium">{user.chatNickname}</span>
            </p>
          )}
          {useNickname && (
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.privacyNicknamePlaceholder}
              className="mt-3"
            />
          )}
        </PrivacyToggleRow>
      </div>

      <Button
        onClick={() =>
          handleSave(
            updateProfile,
            refreshUser,
            toast,
            t,
            useNickname,
            nickname,
          )
        }
        variant="primary"
        className="self-start"
      >
        {t.save}
      </Button>

      <p className="text-muted text-xs">{t.privacySessionsNote}</p>

      <Link
        href={`/v1/${params?.lang ?? ""}/settings/sessions`}
        className="text-brand text-sm font-medium hover:underline"
      >
        {t.navSessions}
      </Link>
    </div>
  );
}

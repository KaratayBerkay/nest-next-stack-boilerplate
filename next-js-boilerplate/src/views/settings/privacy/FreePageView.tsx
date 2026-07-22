"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ClassNameProps } from "@/types/ui/ClassName-types";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsPrivacyPageInfo } from "@/constants/page-info";
import { PrivacyToggleRow } from "./PrivacyToggleRow";

async function handleSave(
  toast: ReturnType<typeof useToast>["toast"],
  hideProfilePicture: boolean,
  useNickname: boolean,
  nickname: string,
  enable2FA: boolean,
) {
  const payload = { hideProfilePicture, useNickname, nickname, enable2FA };
  console.log("Saving privacy preferences:", payload);
  toast({ title: "Preferences saved", variant: "success" });
}

export function FreePageView({ className }: ClassNameProps) {
  const params = useParams<{ lang: string }>();
  const t = useMessages("settings");
  const { toast } = useToast();

  const [hideProfilePicture, setHideProfilePicture] = useState(false);
  const [useNickname, setUseNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const [enable2FA, setEnable2FA] = useState(false);

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
          {useNickname && (
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.privacyNicknamePlaceholder}
              className="mt-3"
            />
          )}
        </PrivacyToggleRow>

        <PrivacyToggleRow
          title={t.privacyTwoFactor}
          description={t.privacyTwoFactorDesc}
          checked={enable2FA}
          onChange={setEnable2FA}
        />
      </div>

      <Button
        onClick={() => handleSave(toast, hideProfilePicture, useNickname, nickname, enable2FA)}
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

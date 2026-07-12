"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsPrivacyPageInfo } from "@/constants/page-info";

async function handleSave(toast: ReturnType<typeof useToast>["toast"]) {
  toast({ title: "Preferences saved", variant: "success" });
}

export function FreePageView() {
  const params = useParams<{ lang: string }>();
  const t = useMessages("settings");
  const { toast } = useToast();

  const [hideProfilePicture, setHideProfilePicture] = useState(false);
  const [useNickname, setUseNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const [enable2FA, setEnable2FA] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.privacyHeading}</h2>
        <PageInfoButton content={settingsPrivacyPageInfo} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="border-border flex items-center justify-between rounded-lg border p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {t.privacyHideProfilePicture}
            </span>
            <span className="text-muted text-xs">
              {t.privacyHideProfilePictureDesc}
            </span>
          </div>
          <Switch
            checked={hideProfilePicture}
            onChange={(e) => setHideProfilePicture(e.target.checked)}
          />
        </div>

        <div className="border-border flex flex-col justify-between rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{t.privacyNickname}</span>
              <span className="text-muted text-xs">
                {t.privacyNicknameDesc}
              </span>
            </div>
            <Switch
              checked={useNickname}
              onChange={(e) => setUseNickname(e.target.checked)}
            />
          </div>
          {useNickname && (
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.privacyNicknamePlaceholder}
              className="mt-3"
            />
          )}
        </div>

        <div className="border-border flex items-center justify-between rounded-lg border p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{t.privacyTwoFactor}</span>
            <span className="text-muted text-xs">{t.privacyTwoFactorDesc}</span>
          </div>
          <Switch
            checked={enable2FA}
            onChange={(e) => setEnable2FA(e.target.checked)}
          />
        </div>
      </div>

      <Button
        onClick={() => handleSave(toast)}
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

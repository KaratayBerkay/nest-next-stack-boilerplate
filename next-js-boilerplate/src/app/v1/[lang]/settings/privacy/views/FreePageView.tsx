"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Switch } from "@/components/ui/Switch";

export function FreePageView() {
  const params = useParams<{ lang: string }>();
  const t = useMessages("settings");
  const { toast } = useToast();

  const [hideProfilePicture, setHideProfilePicture] = useState(false);
  const [useNickname, setUseNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const [enable2FA, setEnable2FA] = useState(false);

  const handleSave = async () => {
    toast({ title: "Preferences saved", variant: "success" });
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h2 className="text-lg font-semibold">{t.privacyHeading}</h2>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{t.privacyHideProfilePicture}</span>
            <span className="text-xs text-muted">{t.privacyHideProfilePictureDesc}</span>
          </div>
          <Switch checked={hideProfilePicture} onChange={(e) => setHideProfilePicture(e.target.checked)} />
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{t.privacyNickname}</span>
              <span className="text-xs text-muted">{t.privacyNicknameDesc}</span>
            </div>
            <Switch checked={useNickname} onChange={(e) => setUseNickname(e.target.checked)} />
          </div>
          {useNickname && (
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.privacyNicknamePlaceholder}
              className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-fg"
            />
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{t.privacyTwoFactor}</span>
            <span className="text-xs text-muted">{t.privacyTwoFactorDesc}</span>
          </div>
          <Switch checked={enable2FA} onChange={(e) => setEnable2FA(e.target.checked)} />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="self-start rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        {t.save}
      </button>

      <p className="text-xs text-muted">
        {t.privacySessionsNote}
      </p>

      <Link
        href={`/v1/${params?.lang ?? ""}/settings/sessions`}
        className="text-sm font-medium text-brand hover:underline"
      >
        {t.navSessions}
      </Link>
    </div>
  );
}

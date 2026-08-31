"use client";

import { IconAlertCircle } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import type { StorageLimitNoticeProps } from "@/types/messages/StorageLimitNotice-types";

export function StorageLimitNotice({ className }: StorageLimitNoticeProps) {
  const t = useMessages("messages");
  return (
    <div
      className={cn("flex flex-col gap-0.5 border-t px-5 py-3.5", className)}
    >
      <p className="text-error flex items-center gap-2 text-sm font-medium">
        <IconAlertCircle size={16} className="shrink-0" />
        {t.storageLimitReached}
      </p>
      <p className="text-muted pl-6 text-xs">{t.storageLimitUpgradeHint}</p>
    </div>
  );
}

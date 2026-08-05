"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { StorageLimitNoticeProps } from "@/types/messages/StorageLimitNotice-types";

export function StorageLimitNotice({ className }: StorageLimitNoticeProps) {
  const t = useMessages("messages");
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center p-6",
        className,
      )}
    >
      <Card variant="surface" className="max-w-sm p-6 text-center">
        <h2 className="text-fg text-lg font-semibold">
          {t.storageLimitReached}
        </h2>
        <p className="text-muted mt-2 text-sm">{t.storageLimitUpgradeHint}</p>
      </Card>
    </div>
  );
}

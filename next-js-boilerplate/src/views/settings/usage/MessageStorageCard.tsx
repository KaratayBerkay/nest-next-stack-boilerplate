"use client";

import { useQuery } from "@tanstack/react-query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { messageUsageQueryOptions } from "@/api/client/usage/query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/Progress";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function MessageStorageCard({ className }: ClassNameProps) {
  const t = useMessages("settings");
  const { data, isLoading } = useQuery(messageUsageQueryOptions());

  if (isLoading || !data) {
    return (
      <Card variant="surface" className={cn("p-5", className)}>
        <div className="animate-pulse">
          <div className="bg-surface h-4 w-36 rounded" />
          <div className="bg-surface mt-4 h-2 w-full rounded" />
        </div>
      </Card>
    );
  }

  const percent = Math.min(
    100,
    Math.round((data.bytes / data.limitBytes) * 100),
  );
  const overLimit = data.bytes >= data.limitBytes;

  return (
    <Card variant="surface" className={cn("p-5", className)}>
      <div className="flex flex-col gap-1.5">
        <Label>{t.usageStored}</Label>
        <p className="text-fg text-2xl font-semibold tabular-nums">
          {formatBytes(data.bytes)}
          <span className="text-muted ml-1 text-sm font-normal">
            {t.usageOf} {formatBytes(data.limitBytes)}
          </span>
        </p>
        <p className="text-muted text-sm">
          {data.letters.toLocaleString()} {t.usageLetters} · {t.usageMonth}
        </p>
      </div>

      <Progress
        value={percent}
        max={100}
        size="md"
        variant={overLimit ? "neon" : "default"}
        showValueLabel
        className="mt-4"
      />

      {overLimit && (
        <p className="text-error mt-3 text-sm">{t.usageLimitReached}</p>
      )}

      <p className="text-muted mt-3 text-xs">{t.usageUpgradeHint}</p>
    </Card>
  );
}

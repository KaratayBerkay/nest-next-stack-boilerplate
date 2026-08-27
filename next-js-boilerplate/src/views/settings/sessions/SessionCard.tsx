"use client";

import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconWorld,
} from "@tabler/icons-react";
import { formatDateTimeByPreference } from "@/lib/date-time";
import { deviceLabel } from "@/lib/sessions/device-label";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { SessionCardProps } from "@/types/settings/SessionCard-types";

export function SessionCard({
  session,
  isCurrent,
  dateDisplay,
  onRevoke,
}: SessionCardProps) {
  const t = useMessages("settings");
  const deviceType = session.deviceType?.toUpperCase();
  const isMobile =
    deviceType === "MOBILE_IOS" ||
    deviceType === "MOBILE_ANDROID" ||
    (!deviceType &&
      (session.userAgent?.toLowerCase().includes("mobile") ||
        session.userAgent?.toLowerCase().includes("android") ||
        session.userAgent?.toLowerCase().includes("iphone")));

  return (
    <div
      className={cn(
        "border-border bg-bg flex items-start justify-between gap-4 rounded-lg border p-4",
        isCurrent && "border-brand/30 ring-brand/10 ring-1",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isCurrent ? "bg-brand/10 text-brand" : "bg-surface text-muted",
          )}
        >
          {isMobile ? (
            <IconDeviceMobile size={20} stroke={1.5} />
          ) : (
            <IconDeviceDesktop size={20} stroke={1.5} />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {deviceLabel(
                session.userAgent,
                session.deviceType,
                t.unknownDevice,
              )}
            </span>
            {isCurrent && (
              <Badge variant="soft" pill className="text-[10px]">
                {t.currentSession}
              </Badge>
            )}
            {session.trusted && (
              <Badge variant="success" pill className="text-[10px]">
                {t.trustedDevice}
              </Badge>
            )}
          </div>
          <div className="text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {session.ip && (
              <span className="flex items-center gap-1">
                <IconWorld size={12} stroke={1.5} />
                {t.ipLabel} {session.ip}
              </span>
            )}
            {session.issuedAt && (
              <span>
                {t.startedLabel}{" "}
                {formatDateTimeByPreference(session.issuedAt, dateDisplay)}
              </span>
            )}
          </div>
          {session.deviceId && (
            <details className="group mt-1">
              <summary className="text-muted/60 hover:text-muted cursor-pointer list-none text-[10px]">
                {t.moreDeviceInfo}
              </summary>
              <div className="text-muted/50 mt-1 flex flex-col gap-0.5 text-[10px]">
                <span>
                  {t.deviceId} {session.deviceId}
                </span>
                <span className="break-all">
                  {t.userAgent} {session.userAgent ?? "N/A"}
                </span>
              </div>
            </details>
          )}
        </div>
      </div>
      {!isCurrent && (
        <Button
          variant="link"
          size="xs"
          className="shrink-0"
          onClick={() => onRevoke(session.sessionId)}
          aria-label={`Revoke session from ${session.ip ?? t.unknownDevice}`}
        >
          {t.revoke}
        </Button>
      )}
    </div>
  );
}

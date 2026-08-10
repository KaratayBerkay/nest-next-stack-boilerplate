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
import type { SessionCardProps } from "@/types/settings/SessionCard-types";

export function SessionCard({
  session,
  isCurrent,
  dateDisplay,
  onRevoke,
}: SessionCardProps) {
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
              {deviceLabel(session.userAgent, session.deviceType)}
            </span>
            {isCurrent && (
              <Badge variant="soft" pill className="text-[10px]">
                Current
              </Badge>
            )}
            {session.trusted && (
              <Badge variant="success" pill className="text-[10px]">
                Trusted
              </Badge>
            )}
          </div>
          <div className="text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {session.ip && (
              <span className="flex items-center gap-1">
                <IconWorld size={12} stroke={1.5} />
                IP: {session.ip}
              </span>
            )}
            {session.issuedAt && (
              <span>
                Started:{" "}
                {formatDateTimeByPreference(session.issuedAt, dateDisplay)}
              </span>
            )}
          </div>
          {session.deviceId && (
            <details className="group mt-1">
              <summary className="text-muted/60 hover:text-muted cursor-pointer list-none text-[10px]">
                More Device Info
              </summary>
              <div className="text-muted/50 mt-1 flex flex-col gap-0.5 text-[10px]">
                <span>Device ID: {session.deviceId}</span>
                <span className="break-all">
                  User-Agent: {session.userAgent ?? "N/A"}
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
          aria-label={`Revoke session from ${session.ip ?? "unknown device"}`}
        >
          Revoke
        </Button>
      )}
    </div>
  );
}

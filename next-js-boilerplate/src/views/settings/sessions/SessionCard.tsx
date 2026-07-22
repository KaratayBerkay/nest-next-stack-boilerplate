"use client";

import { IconDeviceDesktop, IconDeviceMobile, IconWorld } from "@tabler/icons-react";
import { formatDateTimeByPreference } from "@/lib/date-time";
import { cn } from "@/lib/cn";
import type { SessionCardProps } from "@/types/settings/SessionCard-types";

export function SessionCard({ session, isCurrent, dateDisplay, onRevoke }: SessionCardProps) {
  const isMobile =
    session.userAgent?.toLowerCase().includes("mobile") ||
    session.userAgent?.toLowerCase().includes("android") ||
    session.userAgent?.toLowerCase().includes("iphone");

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
              {session.userAgent
                ? session.userAgent
                    .split(" ")
                    .slice(0, 3)
                    .join(" ") || session.userAgent.slice(0, 40)
                : "Unknown device"}
            </span>
            {isCurrent && (
              <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
                Current
              </span>
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
                Started: {formatDateTimeByPreference(session.issuedAt, dateDisplay)}
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
                <span className="break-all">User-Agent: {session.userAgent ?? "N/A"}</span>
              </div>
            </details>
          )}
        </div>
      </div>
      {!isCurrent && (
        <button
          onClick={() => onRevoke(session.sessionId)}
          className="shrink-0 text-xs whitespace-nowrap text-red-600 transition-colors hover:text-red-700"
          aria-label={`Revoke session from ${session.ip ?? "unknown device"}`}
        >
          Revoke
        </button>
      )}
    </div>
  );
}

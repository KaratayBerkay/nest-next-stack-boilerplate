"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { IconEye, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PulseBlockFallback } from "@/fallbacks";
import { liveStreamsQueryOptions } from "@/api/client/rtc/streams-query";
import {
  participantInitials,
  participantPalette,
} from "@/lib/rtc/participant-color";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function RtcLiveDiscoveryView() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";

  const { data: streams, isLoading } = useQuery(liveStreamsQueryOptions());

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.liveTitle}</h1>
        <Link href={`/v1/${lang}/rtc/live/go-live`}>
          <Button size="sm">
            <IconPlus size={16} />
            {t.goLive}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <PulseBlockFallback />
      ) : !streams || streams.length === 0 ? (
        <p className="text-muted text-sm">{t.noLiveStreams}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => {
            const palette = participantPalette(
              stream.broadcaster.id || stream.broadcaster.name || "?",
            );
            return (
              <Link
                key={stream.id}
                href={`/v1/${lang}/rtc/live/${stream.slug}`}
                className="group border-border bg-surface hover:border-brand/50 focus-visible:ring-brand flex flex-col gap-2.5 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
              >
                <div
                  className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg"
                  style={{
                    background: `radial-gradient(80% 100% at 50% 40%, ${palette.tintStrong}, ${palette.tintSoft})`,
                  }}
                >
                  <span
                    aria-hidden
                    className="flex size-14 items-center justify-center rounded-full text-lg font-semibold shadow-lg"
                    style={{ background: palette.fill, color: palette.onFill }}
                  >
                    {participantInitials(stream.broadcaster.name || "?")}
                  </span>
                  <span className="bg-error text-error-fg absolute top-2 left-2 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                    <span className="relative flex size-1.5" aria-hidden>
                      <span className="bg-error-fg absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                      <span className="bg-error-fg relative inline-flex size-1.5 rounded-full" />
                    </span>
                    {t.liveBadge}
                  </span>
                  <span className="bg-overlay/60 text-overlay-fg absolute right-2 bottom-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] backdrop-blur-sm">
                    <IconEye size={11} aria-hidden />
                    {stream.viewerCount}
                  </span>
                </div>
                <p className="truncate text-sm font-medium">{stream.title}</p>
                <div className="flex items-center gap-1.5">
                  <Avatar
                    src={stream.broadcaster.avatarUrl ?? undefined}
                    fallback={participantInitials(
                      stream.broadcaster.name || "?",
                    )}
                    size="xs"
                    style={{ background: palette.fill, color: palette.onFill }}
                  />
                  <span className="text-muted truncate text-xs">
                    {stream.broadcaster.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

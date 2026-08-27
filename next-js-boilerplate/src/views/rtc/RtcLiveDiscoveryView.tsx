"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { IconBroadcast, IconEye, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PulseBlockFallback } from "@/fallbacks";
import { liveStreamsQueryOptions } from "@/api/client/rtc/streams-query";
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
          {streams.map((stream) => (
            <Link
              key={stream.id}
              href={`/v1/${lang}/rtc/live/${stream.slug}`}
              className="hover:border-brand/50 flex flex-col gap-2 rounded-lg border p-3 transition-colors"
            >
              <div className="bg-surface flex aspect-video items-center justify-center rounded">
                <IconBroadcast className="text-muted size-8" aria-hidden />
              </div>
              <p className="truncate text-sm font-medium">{stream.title}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Avatar
                    src={stream.broadcaster.avatarUrl ?? undefined}
                    fallback={stream.broadcaster.name || "?"}
                    size="xs"
                  />
                  <span className="text-muted truncate text-xs">
                    {stream.broadcaster.name}
                  </span>
                </div>
                <Badge variant="error" className="gap-1">
                  <IconEye size={12} aria-hidden />
                  {stream.viewerCount}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

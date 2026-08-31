"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconUsers } from "@tabler/icons-react";
import type { MessagesSidebarRoomsProps } from "@/types/messages/MessagesSidebarRooms-types";

function roomDisplayName(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function MessagesSidebarRooms({
  rooms,
  roomsLoading,
  lang,
}: MessagesSidebarRoomsProps) {
  const t = useMessages("messages");

  if (roomsLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <p className="text-muted py-16 text-center text-sm">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {rooms.length === 0 ? (
        <p className="text-muted py-16 text-center text-sm">{t.noGroups}</p>
      ) : (
        <div className="flex flex-col">
          {rooms.map((room, i) => (
            <Link
              key={room.slug}
              href={`/v1/${lang}/chat-room?room=${room.slug}`}
              className="animate-fade-in-up hover:bg-surface/50 flex w-full items-center gap-3 px-5 py-3 text-left transition-colors"
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                <IconUsers size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="truncate text-sm font-semibold">
                  {roomDisplayName(room.slug)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

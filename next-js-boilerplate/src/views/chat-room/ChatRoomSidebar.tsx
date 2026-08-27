"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconCrown } from "@tabler/icons-react";
import { initials } from "@/lib/initials";
import {
  SidebarCloseButton,
  RoomButton,
} from "@/views/chat-room/ChatRoomSubComponents";
import type { ChatRoomSidebarProps } from "@/types/views/chat-room/ChatRoomSidebar-types";

export function ChatRoomSidebar({
  sidebarOpen,
  rooms,
  room,
  roomCounts,
  vipRooms,
  roomMembers,
  user,
  showSelfCrown,
  t,
  onSetSidebarOpen,
  onSelectRoom,
}: ChatRoomSidebarProps) {
  return (
    <div
      className={`${
        sidebarOpen
          ? "fixed inset-y-0 left-0 z-50 w-full md:static md:z-auto md:w-56"
          : "hidden md:flex md:w-56"
      } border-border bg-bg flex max-h-full flex-col gap-4 rounded-xl border p-3 md:p-4`}
    >
      <div className="flex items-center justify-between pb-3 md:hidden">
        <p className="text-muted text-xs font-semibold uppercase">{t.rooms}</p>
        <SidebarCloseButton
          onClick={() => onSetSidebarOpen(false)}
          label={t.closeSidebar}
        />
      </div>

      <Tabs defaultValue="rooms" className="flex flex-1 flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="rooms" className="flex-1">
            {t.rooms}
          </TabsTrigger>
          <TabsTrigger value="online" className="flex-1">
            {t.online.replace("{count}", String(roomCounts[room] ?? 0))}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="rooms"
          className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
        >
          {rooms.map((r) => {
            const count = roomCounts[r] ?? 0;
            const isVip = vipRooms.includes(r);
            return (
              <RoomButton
                key={r}
                room={r}
                isActive={room === r}
                count={count}
                isVip={isVip}
                onSelect={() => onSelectRoom(r)}
              />
            );
          })}
        </TabsContent>

        <TabsContent
          value="online"
          className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
        >
          {roomMembers.length === 0 ? (
            <p className="text-muted px-0.5 text-xs">{t.noOneHere}</p>
          ) : (
            roomMembers.map((m) => {
              const displayName = m.chatNickname || m.name;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                >
                  <div className="relative h-10 w-10 shrink-0">
                    <Avatar
                      src={m.avatarUrl ?? undefined}
                      fallback={initials(displayName)}
                      className="bg-brand text-brand-fg ring-success ring-offset-bg h-10 w-10 text-[10px] ring-2 ring-offset-2"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-fg truncate text-sm font-medium">
                      {displayName}
                    </span>
                  </div>
                  {showSelfCrown && m.id === user.id && (
                    <IconCrown
                      size={12}
                      stroke={2}
                      className="text-brand shrink-0"
                    />
                  )}
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

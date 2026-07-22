"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconCrown } from "@tabler/icons-react";
import { initials } from "@/lib/initials";
import { SidebarCloseButton, RoomButton } from "@/views/chat-room/ChatRoomSubComponents";

interface ChatRoomSidebarProps {
  useNativeControls: boolean;
  sidebarOpen: boolean;
  rooms: string[];
  room: string;
  roomCounts: Record<string, number>;
  vipRooms: string[];
  roomMembers: { id: string; name: string; avatar?: string }[];
  user: { id: string; name?: string | null };
  showSelfCrown: boolean;
  t: Record<string, string>;
  onSetSidebarOpen: (open: boolean) => void;
  onSelectRoom: (r: string) => void;
}

export function ChatRoomSidebar({
  useNativeControls,
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
        <p className="text-muted text-xs font-semibold uppercase">Rooms</p>
        <SidebarCloseButton
          useNativeControls={useNativeControls}
          onClick={() => onSetSidebarOpen(false)}
        />
      </div>

      <Tabs defaultValue="rooms" className="flex flex-1 flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="rooms" className="flex-1">
            Rooms
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
                useNativeControls={useNativeControls}
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
            roomMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <div className="relative h-10 w-10 shrink-0">
                  <Avatar
                    fallback={initials(m.name)}
                    className="bg-brand text-brand-fg ring-success ring-offset-bg h-10 w-10 text-[10px] ring-2 ring-offset-2"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-fg truncate text-sm font-medium">
                    {m.name}
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
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

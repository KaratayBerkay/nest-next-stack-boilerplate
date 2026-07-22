"use client";

import { Avatar } from "@/components/ui/Avatar";
import { PageInfoButton } from "@/components/ui/page-info";
import { initials } from "@/lib/initials";
import { chatRoomPageInfo } from "@/constants/page-info";

interface ChatRoomHeaderProps {
  user: { id: string; name?: string | null; email?: string | null };
  connectionState: string;
  showPageInfo: boolean;
  t: Record<string, string>;
}

export function ChatRoomHeader({ user, connectionState, showPageInfo, t }: ChatRoomHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar
            fallback={initials(user?.name ?? user?.email ?? "?")}
            className="h-8 w-8 text-[10px]"
            title={
              connectionState === "online"
                ? t.connected
                : connectionState === "connecting"
                  ? t.connecting
                  : t.disconnected
            }
          />
          {connectionState === "online" ? (
            <span className="border-bg bg-success absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
          ) : connectionState === "connecting" ? (
            <span className="border-bg bg-success absolute -right-0.5 -bottom-0.5 h-3 w-3 animate-pulse rounded-full border-2" />
          ) : (
            <span className="border-bg bg-error absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
          )}
        </div>
        <h2 className="text-brand text-lg font-bold">{t.title}</h2>
      </div>
      {showPageInfo && <PageInfoButton content={chatRoomPageInfo} />}
    </div>
  );
}

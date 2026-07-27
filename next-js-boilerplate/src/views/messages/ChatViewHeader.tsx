"use client";

import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/button/icon-button";
import { IconChevronLeft } from "@tabler/icons-react";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { ChatViewHeaderProps } from "@/types/messages/ChatViewHeader-types";

export function ChatViewHeader({
  selectedUser,
  setSelectedUser,
  setSidebarOpen,
  onlineUsers,
  isTyping,
}: ChatViewHeaderProps) {
  const t = useMessages("messages");
  const isOnline = onlineUsers.has(selectedUser.id);

  return (
    <div className="flex items-center gap-3 border-b px-5 py-3">
      <IconButton
        icon={<IconChevronLeft size={20} />}
        label="Back to conversations"
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          setSelectedUser(null);
          setSidebarOpen(true);
        }}
        className="mr-1 md:hidden"
      />
      <Avatar
        fallback={initials(selectedUser.name ?? selectedUser.email ?? "?")}
        className={cn(
          "bg-brand text-brand-fg h-10 w-10 shrink-0 text-xs",
          isOnline && "ring-success ring-offset-bg ring-2 ring-offset-2",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {selectedUser.name}
          </span>
          {isOnline && (
            <span className="bg-success h-2 w-2 shrink-0 rounded-full" />
          )}
        </div>
        <p className="text-xs">
          {isTyping ? (
            <span className="text-brand animate-pulse">{t.typing}</span>
          ) : isOnline ? (
            <span className="text-muted">{t.connected}</span>
          ) : (
            <span className="text-muted">{t.disconnected}</span>
          )}
        </p>
      </div>
    </div>
  );
}

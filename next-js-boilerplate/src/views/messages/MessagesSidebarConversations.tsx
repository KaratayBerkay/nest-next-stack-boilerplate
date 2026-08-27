"use client";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { conversationPreviewText } from "@/lib/messages/conversation-preview";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { formatDateByPreference } from "@/lib/date-time";
import { SkeletonConversationSidebar } from "@/components/ui/skeleton-shapes";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import type { MessagesSidebarConversationsProps } from "@/types/messages/MessagesSidebarConversations-types";

export function MessagesSidebarConversations({
  conversations,
  selectedUser,
  openConversation,
  onlineUsers,
  convsError,
  convsLoading,
  onToggleFavorite,
  emptyMessage,
}: MessagesSidebarConversationsProps) {
  const t = useMessages("messages");
  const dateDisplay = useDateDisplayCookie();

  if (convsLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
        <SkeletonConversationSidebar />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {convsError && (
        <p className="text-error py-16 text-center text-sm">{t.failedToLoad}</p>
      )}
      {!convsError && conversations.length === 0 && (
        <p className="text-muted py-16 text-center text-sm">
          {emptyMessage ?? t.noConversations}
        </p>
      )}
      {conversations.length > 0 && (
        <div className="flex flex-col">
          {conversations.map((c, i) => (
            <div
              key={c.user.id}
              role="button"
              tabIndex={0}
              onClick={() => openConversation(c.user)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openConversation(c.user);
                }
              }}
              className={cn(
                "animate-fade-in-up hover:bg-surface/50 flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors",
                selectedUser?.id === c.user.id
                  ? "bg-brand/10"
                  : "border-border border-b",
              )}
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <div className="relative h-12 w-12 shrink-0">
                <Avatar
                  src={c.user.avatarUrl ?? undefined}
                  fallback={initials(c.user.name ?? c.user.email ?? "?")}
                  className={cn(
                    "bg-brand text-brand-fg h-12 w-12 text-sm",
                    onlineUsers.has(c.user.id) &&
                      "ring-success ring-offset-bg ring-2 ring-offset-2",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {c.user.name || c.user.email}
                  </span>
                  {!c.noHistory && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-muted text-[11px]">
                        {formatDateByPreference(c.lastTime, dateDisplay)}
                      </span>
                      <button
                        type="button"
                        aria-label={
                          c.favorite
                            ? t.unfavoriteConversation
                            : t.favoriteConversation
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(c.user.id, !c.favorite);
                        }}
                        className="text-muted hover:text-brand"
                      >
                        {c.favorite ? (
                          <IconStarFilled size={16} className="text-brand" />
                        ) : (
                          <IconStar size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="text-muted min-w-0 truncate text-sm">
                    {c.noHistory
                      ? t.startChatting
                      : conversationPreviewText(
                          c.lastMessage,
                          c.hasAttachments,
                          t,
                        )}
                  </p>
                  {c.unread > 0 && (
                    <span className="bg-error text-error-fg flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold">
                      {c.unread > 99 ? "99+" : c.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

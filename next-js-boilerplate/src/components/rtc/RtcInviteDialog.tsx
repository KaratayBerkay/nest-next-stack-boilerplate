"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PulseBlockFallback } from "@/fallbacks";
import { friendsQueryOptions } from "@/api/client/friends/query";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface RtcInviteDialogProps {
  onInvite: (userId: string) => Promise<unknown>;
  children: (open: () => void) => ReactNode;
}

/** Friend picker for "invite to meeting" — reuses the existing friends list
 *  (server-side enforces the target actually is a friend). */
export function RtcInviteDialog({ onInvite, children }: RtcInviteDialogProps) {
  const t = useMessages("rtc");
  const [open, setOpen] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const { data: friends, isLoading } = useQuery({
    ...friendsQueryOptions(),
    enabled: open,
  });

  const handleInvite = async (userId: string) => {
    await onInvite(userId);
    setInvitedIds((prev) => new Set(prev).add(userId));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setInvitedIds(new Set());
      }}
    >
      {children(() => setOpen(true))}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.inviteToMeeting}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <PulseBlockFallback />
        ) : !friends || friends.length === 0 ? (
          <p className="text-fg-muted text-sm">{t.noFriendsToInvite}</p>
        ) : (
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2"
              >
                <Avatar fallback={friend.name || friend.email} size="sm" />
                <span className="flex-1 truncate text-sm">{friend.name}</span>
                <Button
                  size="sm"
                  variant={invitedIds.has(friend.id) ? "ghost" : "outline"}
                  disabled={invitedIds.has(friend.id)}
                  onClick={() => void handleInvite(friend.id)}
                >
                  {invitedIds.has(friend.id) ? t.invited : t.invite}
                </Button>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

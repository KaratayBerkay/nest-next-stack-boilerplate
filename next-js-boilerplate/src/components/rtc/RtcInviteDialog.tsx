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
import { FriendPickList } from "@/components/rtc/FriendPickList";
import { friendsQueryOptions } from "@/api/client/friends/query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";

interface RtcInviteDialogProps {
  onInvite: (userId: string) => Promise<unknown>;
  children: (open: () => void) => ReactNode;
}

/** Friend picker for "invite to meeting" — reuses the existing friends list
 *  (server-side enforces the target actually is a friend). */
export function RtcInviteDialog({ onInvite, children }: RtcInviteDialogProps) {
  const t = useMessages("rtc");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const { data: friends, isLoading } = useQuery({
    ...friendsQueryOptions(),
    enabled: open,
  });

  const handleInvite = async (userId: string) => {
    try {
      await onInvite(userId);
      setInvitedIds((prev) => new Set(prev).add(userId));
    } catch {
      toast({ title: t.inviteFailed, variant: "destructive" });
    }
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
        <div className="px-6 pt-3 pb-2">
          <FriendPickList
            friends={friends}
            isLoading={isLoading}
            emptyText={t.noFriendsToInvite}
            noMatchText={t.noFriendsMatch}
            searchPlaceholder={t.searchFriendsPlaceholder}
            listClassName="max-h-72"
            trailing={(friend) => (
              <Button
                size="sm"
                variant={invitedIds.has(friend.id) ? "ghost" : "outline"}
                disabled={invitedIds.has(friend.id)}
                onClick={() => void handleInvite(friend.id)}
              >
                {invitedIds.has(friend.id) ? t.invited : t.invite}
              </Button>
            )}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

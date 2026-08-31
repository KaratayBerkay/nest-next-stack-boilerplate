"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IconCircleCheckFilled,
  IconCirclePlus,
  IconX,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FriendPickList } from "@/components/rtc/FriendPickList";
import { friendsQueryOptions } from "@/api/client/friends/query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { FriendUser } from "@/api/server/messages/friends";

interface RtcCreateMeetingDialogProps {
  /** Creates the meeting (and sends the invites) — thrown errors keep the
   *  dialog open so the user can retry; on resolve the caller navigates. */
  onSubmit: (title: string, inviteeIds: string[]) => Promise<void>;
  children: (open: () => void) => ReactNode;
}

/** Google-Meet-style "new meeting" dialog: a large modal with a prominent
 *  title field and a guests section — search your friends, pick any number,
 *  and they're invited the moment the meeting is created. */
export function RtcCreateMeetingDialog({
  onSubmit,
  children,
}: RtcCreateMeetingDialogProps) {
  const t = useMessages("rtc");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Map<string, FriendUser>>(new Map());
  const [busy, setBusy] = useState(false);

  const { data: friends, isLoading } = useQuery({
    ...friendsQueryOptions(),
    enabled: open,
  });

  const reset = () => {
    setTitle("");
    setSelected(new Map());
    setBusy(false);
  };

  const toggle = (friend: FriendUser) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(friend.id)) next.delete(friend.id);
      else next.set(friend.id, friend);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await onSubmit(title.trim(), [...selected.keys()]);
      // The caller navigates into the room on success; no local cleanup
      // matters at that point, but reset anyway for the client-side-nav case.
      setOpen(false);
      reset();
    } catch {
      // Caller already toasted; keep the dialog open for a retry.
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      {children(() => setOpen(true))}
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{t.newMeetingTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSubmit();
            }}
            placeholder={t.meetingTitlePlaceholder}
            aria-label={t.meetingTitleLabel}
            className="border-border focus:border-brand placeholder:text-muted w-full border-0 border-b-2 bg-transparent px-1 pt-1 pb-2 text-xl font-medium transition-colors outline-none"
          />

          <div className="flex min-h-0 flex-col gap-3">
            <span className="text-sm font-medium">{t.inviteFriendsLabel}</span>

            {selected.size > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[...selected.values()].map((friend) => (
                  <span
                    key={friend.id}
                    className="bg-surface border-border flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-1"
                  >
                    <Avatar fallback={friend.name || friend.email} size="xs" />
                    <span className="max-w-36 truncate text-sm">
                      {friend.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(friend)}
                      aria-label={t.removeInvitee.replace(
                        "{name}",
                        friend.name,
                      )}
                      className="text-muted hover:bg-surface-hover hover:text-fg rounded-full p-0.5 transition-colors"
                    >
                      <IconX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <FriendPickList
              friends={friends}
              isLoading={isLoading}
              emptyText={t.noFriendsToInvite}
              noMatchText={t.noFriendsMatch}
              searchPlaceholder={t.searchFriendsPlaceholder}
              onRowClick={toggle}
              trailing={(friend) =>
                selected.has(friend.id) ? (
                  <IconCircleCheckFilled
                    size={20}
                    className="text-brand shrink-0"
                    aria-hidden
                  />
                ) : (
                  <IconCirclePlus
                    size={20}
                    className="text-muted shrink-0"
                    aria-hidden
                  />
                )
              }
            />
          </div>
        </div>

        <DialogFooter className="border-t">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={busy || !title.trim()}
          >
            {busy ? t.creating : t.createAndJoin}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

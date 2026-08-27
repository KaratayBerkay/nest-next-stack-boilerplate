"use client";

import { useState } from "react";
import type { PendingRequestCardProps } from "@/types/find-friends/PendingRequestCard-types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { initials } from "@/lib/initials";

export function PendingRequestCard({
  request,
  onAccept,
  onDecline,
  sentByYouLabel,
  acceptLabel,
  declineLabel,
  awaitingLabel,
  acceptFailedMessage,
  declineFailedMessage,
}: PendingRequestCardProps) {
  const { user, direction, id } = request;
  const { toast } = useToast();
  // Regression: this previously discarded the accept/decline boolean and had
  // no busy state at all — a failure (expired request, network blip) showed
  // nothing (the row just stayed put with no explanation), and nothing
  // stopped a rapid double-click from firing two concurrent mutations.
  const [pendingAction, setPendingAction] = useState<
    "accept" | "decline" | null
  >(null);

  async function respond(action: "accept" | "decline") {
    if (pendingAction) return;
    setPendingAction(action);
    try {
      const ok = await (action === "accept"
        ? onAccept(user.id)
        : onDecline(user.id));
      if (!ok) {
        toast({
          title:
            action === "accept" ? acceptFailedMessage : declineFailedMessage,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: action === "accept" ? acceptFailedMessage : declineFailedMessage,
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div key={id} className="flex items-center gap-3 rounded-lg border p-3">
      <Avatar
        fallback={initials(user.name)}
        className="bg-brand text-brand-fg h-10 w-10 shrink-0 text-xs"
      />
      <span className="flex-1 text-sm font-medium">
        {user.name}
        {direction === "outgoing" && (
          <span className="text-muted ml-2 text-xs">{sentByYouLabel}</span>
        )}
      </span>
      {direction === "incoming" ? (
        <>
          <Button
            size="xs"
            disabled={pendingAction !== null}
            loading={pendingAction === "accept"}
            onClick={() => respond("accept")}
          >
            {acceptLabel}
          </Button>
          <Button
            variant="outline"
            size="xs"
            disabled={pendingAction !== null}
            loading={pendingAction === "decline"}
            onClick={() => respond("decline")}
          >
            {declineLabel}
          </Button>
        </>
      ) : (
        <span className="bg-surface text-muted rounded px-3 py-1 text-xs">
          {awaitingLabel}
        </span>
      )}
    </div>
  );
}

import { useState } from "react";
import type { UserSearchCardProps } from "@/types/find-friends/UserSearchCard-types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { initials } from "@/lib/initials";

export function UserSearchCard({
  userId: _userId,
  name,
  isPending,
  onSendRequest,
  pendingLabel,
  addFriendLabel,
  sendFailedMessage,
}: UserSearchCardProps) {
  const { toast } = useToast();
  // Regression: this previously had no busy state at all and no failure
  // feedback — a failed request (network blip, already-friends race) left
  // the button clickable with no explanation, and a fast double-click could
  // fire two concurrent send-request mutations.
  const [sending, setSending] = useState(false);

  async function handleSendRequest() {
    if (sending) return;
    setSending(true);
    try {
      const ok = await onSendRequest();
      if (!ok) {
        toast({ title: sendFailedMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: sendFailedMessage, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Avatar
        fallback={initials(name)}
        className="bg-brand text-brand-fg h-10 w-10 shrink-0 text-xs"
      />
      <span className="flex-1 text-sm font-medium">{name}</span>
      {isPending ? (
        <span className="bg-surface text-muted rounded px-3 py-1 text-xs">
          {pendingLabel}
        </span>
      ) : (
        <Button
          size="sm"
          disabled={sending}
          loading={sending}
          onClick={handleSendRequest}
        >
          {addFriendLabel}
        </Button>
      )}
    </div>
  );
}

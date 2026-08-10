import type { PendingRequestCardProps } from "@/types/find-friends/PendingRequestCard-types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { initials } from "@/lib/initials";

export function PendingRequestCard({
  request,
  onAccept,
  onDecline,
  sentByYouLabel,
  acceptLabel,
  declineLabel,
  awaitingLabel,
}: PendingRequestCardProps) {
  const { user, direction, id } = request;
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
          <Button size="xs" onClick={() => onAccept(user.id)}>
            {acceptLabel}
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onDecline(user.id)}
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

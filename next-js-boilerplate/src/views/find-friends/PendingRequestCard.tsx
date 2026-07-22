import type { PendingRequestCardProps } from "@/types/find-friends/PendingRequestCard-types";
import { Avatar } from "@/components/ui/Avatar";
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
          <button
            onClick={() => onAccept(user.id)}
            className="bg-success rounded px-3 py-1 text-xs text-white hover:brightness-90"
          >
            {acceptLabel}
          </button>
          <button
            onClick={() => onDecline(user.id)}
            className="bg-surface hover:bg-surface-hover rounded px-3 py-1 text-xs"
          >
            {declineLabel}
          </button>
        </>
      ) : (
        <span className="bg-surface text-muted rounded px-3 py-1 text-xs">
          {awaitingLabel}
        </span>
      )}
    </div>
  );
}

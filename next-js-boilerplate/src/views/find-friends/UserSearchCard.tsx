import type { UserSearchCardProps } from "@/types/find-friends/UserSearchCard-types";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";

export function UserSearchCard({
  userId,
  name,
  isPending,
  onSendRequest,
  pendingLabel,
  addFriendLabel,
}: UserSearchCardProps) {
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
        <button
          onClick={onSendRequest}
          className="bg-brand text-brand-fg rounded-lg px-3 py-1 text-sm hover:opacity-80"
        >
          {addFriendLabel}
        </button>
      )}
    </div>
  );
}

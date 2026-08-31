"use client";

import { useMemo, useState, type ReactNode } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { PulseBlockFallback } from "@/fallbacks";
import type { FriendUser } from "@/api/server/messages/friends";

/** Case-insensitive name/email match for the picker's search box. */
export function matchesFriendSearch(
  friend: FriendUser,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    friend.name.toLowerCase().includes(q) ||
    friend.email.toLowerCase().includes(q)
  );
}

interface FriendPickListProps {
  friends: FriendUser[] | undefined;
  isLoading: boolean;
  emptyText: string;
  noMatchText: string;
  searchPlaceholder: string;
  /** Right edge of each row — an invite button, a selected check, etc. */
  trailing: (friend: FriendUser) => ReactNode;
  /** When set, the whole row becomes a button (used for toggle selection). */
  onRowClick?: (friend: FriendUser) => void;
  listClassName?: string;
}

/** Google-Meet-style friend list with a search box: avatar, name, email
 *  per row plus a caller-supplied trailing control. Shared between the
 *  create-meeting dialog (multi-select) and the in-meeting invite dialog
 *  (per-row invite button). */
export function FriendPickList({
  friends,
  isLoading,
  emptyText,
  noMatchText,
  searchPlaceholder,
  trailing,
  onRowClick,
  listClassName,
}: FriendPickListProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => (friends ?? []).filter((f) => matchesFriendSearch(f, search)),
    [friends, search],
  );

  if (isLoading) return <PulseBlockFallback />;
  if (!friends || friends.length === 0) {
    return <p className="text-muted text-sm">{emptyText}</p>;
  }

  const rowInner = (friend: FriendUser) => (
    <>
      <Avatar fallback={friend.name || friend.email} size="sm" />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium">
          {friend.name}
        </span>
        <span className="text-muted block truncate text-xs">
          {friend.email}
        </span>
      </span>
      {trailing(friend)}
    </>
  );

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        leftIcon={<IconSearch size={16} />}
      />
      <div
        className={`flex flex-col gap-0.5 overflow-y-auto ${listClassName ?? "max-h-64"}`}
      >
        {filtered.length === 0 ? (
          <p className="text-muted px-2 py-3 text-sm">{noMatchText}</p>
        ) : (
          filtered.map((friend) =>
            onRowClick ? (
              <button
                key={friend.id}
                type="button"
                onClick={() => onRowClick(friend)}
                className="hover:bg-surface-hover flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors"
              >
                {rowInner(friend)}
              </button>
            ) : (
              <div
                key={friend.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2"
              >
                {rowInner(friend)}
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}

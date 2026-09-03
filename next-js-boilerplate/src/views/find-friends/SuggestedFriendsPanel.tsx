"use client";

import { useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { initials } from "@/lib/initials";
import { fetchSuggestedFriendsServer } from "@/api/server/friends/suggested";
import { useFriendActions } from "@/api/client/friends/actions";
import type { SuggestedUser } from "@/types/find-friends/SuggestedFriendsPanel-types";

async function loadSuggested(
  setLoading: (v: boolean) => void,
  setSuggested: (v: SuggestedUser[]) => void,
  toast: (opts: {
    description?: string;
    variant?: "default" | "destructive" | "success";
  }) => string,
  failedMessage: string,
) {
  setLoading(true);
  try {
    const data = await fetchSuggestedFriendsServer();
    setSuggested(data);
  } catch (err) {
    toast({
      description: err instanceof Error ? err.message : failedMessage,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}

export function SuggestedFriendsPanel() {
  const t = useMessages("find-friends");
  const { toast } = useToast();
  const { sendRequest } = useFriendActions();
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const onAddFriend = async (userId: string) => {
    setSendingId(userId);
    try {
      const ok = await sendRequest(userId);
      if (ok) {
        setSentIds((prev) => new Set(prev).add(userId));
      } else {
        toast({ description: t.failedToSendRequest, variant: "destructive" });
      }
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : t.failedToSendRequest,
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="border-border rounded-xl border p-4">
      <h3 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
        {t.suggestedFriends}
      </h3>
      {!suggested.length && (
        <Button
          variant="soft"
          size="xs"
          className="w-full"
          loading={loading}
          onClick={() =>
            loadSuggested(
              setLoading,
              setSuggested,
              toast,
              t.failedToLoadSuggestions,
            )
          }
        >
          {t.loadSuggestions}
        </Button>
      )}
      {suggested.length > 0 && (
        <div className="flex flex-col gap-2">
          {suggested.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Avatar
                src={s.avatarUrl}
                fallback={initials(s.name ?? "?")}
                className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {s.name ?? t.unknownUser}
                </p>
                <p className="text-muted text-[10px]">
                  {t.mutualFriends.replace("{count}", String(s.mutualFriends))}
                </p>
              </div>
              <Button
                variant={sentIds.has(s.id) ? "soft" : "outline"}
                size="xs"
                disabled={sentIds.has(s.id) || sendingId === s.id}
                loading={sendingId === s.id}
                onClick={() => onAddFriend(s.id)}
              >
                {sentIds.has(s.id) ? t.requestSent : t.addFriend}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

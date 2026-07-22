"use client";

import { useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { fetchSuggestedFriendsServer } from "@/api/server/friends/suggested";
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
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="border-border rounded-xl border p-4">
      <h3 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
        {t.suggestedFriends}
      </h3>
      {!suggested.length && (
        <button
          onClick={() =>
            loadSuggested(setLoading, setSuggested, toast, t.failedToLoadSuggestions)
          }
          disabled={loading}
          className="bg-brand/10 text-brand hover:bg-brand/20 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? t.loadingSuggestions : t.loadSuggestions}
        </button>
      )}
      {suggested.length > 0 && (
        <div className="flex flex-col gap-2">
          {suggested.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Avatar
                fallback={initials(s.name ?? "?")}
                className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {s.name ?? s.email}
                </p>
                <p className="text-muted text-[10px]">
                  {t.mutualFriends.replace("{count}", String(s.mutualFriends))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

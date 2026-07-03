"use client";

import { apiFetch } from "@/lib/api-client";
import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TIERS, tierLabel } from "@/lib/tier";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { IconSearch } from "@tabler/icons-react";

interface UserResult {
  id: string;
  name: string;
  email: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await apiFetch(
        `/api/users/search?q=${encodeURIComponent(q)}&take=20`,
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.items ?? []);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(q), 300);
  };

  const setTier = async (userId: string, tier: string) => {
    setStatusMsg(null);
    try {
      const res = await apiFetch("/api/admin/set-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Tier updated successfully" });
      } else {
        const data = await res.json();
        setStatusMsg({
          type: "error",
          text: data.error ?? "Failed to update tier",
        });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error" });
    }
  };

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message="Sign in as admin" />;
  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-brand text-sm font-semibold">Admin</h2>
        <p className="text-muted text-sm">Access denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">Admin</h2>

      <div className="relative">
        <IconSearch
          size={14}
          stroke={1.5}
          className="text-muted pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
        />
        <input
          type="text"
          value={query}
          onChange={onQueryChange}
          placeholder="Search users by name or email..."
          className="border-border bg-surface text-fg w-full rounded-lg border py-1.5 pr-3 pl-7 text-xs"
        />
      </div>

      {statusMsg && (
        <div
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            statusMsg.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {searching && (
        <p className="text-muted text-center text-xs">Searching...</p>
      )}

      {!searching && results.length === 0 && query.trim().length >= 2 && (
        <p className="text-muted text-center text-xs">No users found</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map((u) => (
          <UserTierRow key={u.id} user={u} onSetTier={setTier} />
        ))}
      </div>
    </div>
  );
}

function UserTierRow({
  user: u,
  onSetTier,
}: {
  user: UserResult;
  onSetTier: (userId: string, tier: string) => void;
}) {
  const [selectedTier, setSelectedTier] = useState("FREE");

  return (
    <div className="border-border flex items-center gap-3 rounded-lg border p-3">
      <Avatar
        fallback={initials(u.name)}
        className="bg-brand h-8 w-8 shrink-0 text-[10px] text-white"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{u.name}</p>
        <p className="text-muted truncate text-xs">{u.email}</p>
      </div>
      <select
        value={selectedTier}
        onChange={(e) => setSelectedTier(e.target.value)}
        className="border-border bg-surface text-fg rounded-lg border px-2 py-1 text-xs"
      >
        {TIERS.map((t) => (
          <option key={t} value={t}>
            {tierLabel(t)}
          </option>
        ))}
      </select>
      <button
        onClick={() => onSetTier(u.id, selectedTier)}
        className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
      >
        Set tier
      </button>
    </div>
  );
}

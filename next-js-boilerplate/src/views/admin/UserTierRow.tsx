"use client";

import { useState } from "react";
import type { UserTierRowProps } from "@/types/admin/UserTierRow-types";
import { TIERS, tierLabel } from "@/lib/tier";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";

export function UserTierRow({ user: u, onSetTier }: UserTierRowProps) {
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

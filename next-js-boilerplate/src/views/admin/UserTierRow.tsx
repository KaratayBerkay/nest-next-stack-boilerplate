"use client";

import { useState } from "react";
import type { UserTierRowProps } from "@/types/admin/UserTierRow-types";
import { TIERS, tierLabel } from "@/lib/tier";
import { Avatar } from "@/components/ui/Avatar";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Button } from "@/components/ui/Button";
import { initials } from "@/lib/initials";

export function UserTierRow({ user: u, onSetTier }: UserTierRowProps) {
  const [selectedTier, setSelectedTier] = useState("FREE");

  return (
    <div className="border-border flex items-center gap-3 rounded-lg border p-3">
      <Avatar
        fallback={initials(u.name)}
        className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{u.name}</p>
        <p className="text-muted truncate text-xs">{u.email}</p>
      </div>
      <NativeSelect
        value={selectedTier}
        onChange={(e) => setSelectedTier(e.target.value)}
        className="text-xs"
      >
        {TIERS.map((t) => (
          <option key={t} value={t}>
            {tierLabel(t)}
          </option>
        ))}
      </NativeSelect>
      <Button size="sm" onClick={() => onSetTier(u.id, selectedTier)}>
        Set tier
      </Button>
    </div>
  );
}

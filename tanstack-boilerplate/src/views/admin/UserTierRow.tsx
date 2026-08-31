"use client";

import { useState } from "react";
import type { UserTierRowProps } from "@/types/admin/UserTierRow-types";
import { TIERS, tierLabel } from "@/lib/tier";
import { Avatar } from "@/components/ui/Avatar";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";

// No `DEACTIVATED` entry: the enum value exists in the Prisma schema, but no
// application code anywhere ever assigns it to a user, so a badge for it
// would be unreachable dead code (`?? STATUS_BADGE.ACTIVE` below is the only
// fallback that matters for any status this map doesn't recognize).
const STATUS_BADGE: Record<
  string,
  {
    labelKey:
      | "statusActive"
      | "statusSuspended"
      | "statusBanned"
      | "statusPendingVerification";
    variant: "success" | "warning" | "error" | "info" | "secondary";
  }
> = {
  ACTIVE: { labelKey: "statusActive", variant: "success" },
  SUSPENDED: { labelKey: "statusSuspended", variant: "warning" },
  BANNED: { labelKey: "statusBanned", variant: "error" },
  PENDING_VERIFICATION: {
    labelKey: "statusPendingVerification",
    variant: "info",
  },
};

export function UserTierRow({
  user: u,
  onSetTier,
  onSetStatus,
  onResetMfa,
  canResetMfa,
}: UserTierRowProps) {
  const t = useMessages("admin");
  const [selectedTier, setSelectedTier] = useState(u.subscriptionTier);
  const statusInfo = STATUS_BADGE[u.status] ?? STATUS_BADGE.ACTIVE;
  const isActive = u.status !== "SUSPENDED" && u.status !== "BANNED";

  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Avatar
          fallback={initials(u.name)}
          className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{u.name}</p>
            <Badge variant={statusInfo.variant} pill>
              {t[statusInfo.labelKey]}
            </Badge>
            <Badge variant="secondary" pill>
              {tierLabel(u.subscriptionTier)}
            </Badge>
          </div>
          <p className="text-muted truncate text-xs">{u.email}</p>
        </div>
        <NativeSelect
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="text-xs"
        >
          {TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {tierLabel(tier)}
            </option>
          ))}
        </NativeSelect>
        <Button size="sm" onClick={() => onSetTier(u.id, selectedTier)}>
          {t.setTier}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isActive ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(t.suspendConfirm)) onSetStatus(u.id, "SUSPENDED");
              }}
            >
              {t.suspendUser}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(t.banConfirm)) onSetStatus(u.id, "BANNED");
              }}
            >
              {t.banUser}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm(t.reactivateConfirm)) onSetStatus(u.id, "ACTIVE");
            }}
          >
            {t.reactivateUser}
          </Button>
        )}
        {canResetMfa && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm(t.resetMfaConfirm)) onResetMfa(u.id);
            }}
          >
            {t.resetMfa}
          </Button>
        )}
      </div>
    </div>
  );
}

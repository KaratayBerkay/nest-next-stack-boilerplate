"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IconSearch } from "@tabler/icons-react";
import { InputWithIcon } from "@/components/ui/Input";
import { UserTierRow } from "./UserTierRow";
import {
  onQueryChange,
  setTier,
  setUserStatus,
  resetUserMfa,
  type UserResult,
} from "@/lib/admin/admin-utils";
import { PageInfoButton } from "@/components/ui/page-info";
import { adminPageInfo } from "@/constants/page-info";
import { AccessDeniedPage } from "@/features/statics";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

export default function PageContent({ className }: ClassNameProps) {
  const { user } = useAuth();
  const t = useMessages("admin");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const requestId = useRef(0);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  // resetMfa is restricted to SUPERADMIN on the backend (@Roles) — hidden
  // rather than shown-then-denied for a plain ADMIN, unlike tier/status
  // changes which only sometimes fail depending on the specific target.
  const canResetMfa = user?.role === "SUPERADMIN";

  if (!isAdmin) {
    return (
      <div className={`flex flex-col gap-4${className ? ` ${className}` : ""}`}>
        <h2 className="text-brand text-sm font-semibold">{t.title}</h2>
        <AccessDeniedPage message={t.accessDenied} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6${className ? ` ${className}` : ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">{t.title}</h2>
        <PageInfoButton content={adminPageInfo} />
      </div>

      <InputWithIcon
        icon={<IconSearch size={14} stroke={1.5} />}
        type="text"
        value={query}
        onChange={(e) =>
          onQueryChange(
            e,
            setQuery,
            setResults,
            setSearching,
            searchTimer,
            requestId,
          )
        }
        placeholder={t.searchPlaceholder}
        className="text-xs"
      />

      {statusMsg && (
        <div
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            statusMsg.type === "success"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {searching && (
        <p className="text-muted text-center text-xs">{t.searching}</p>
      )}

      {!searching && results.length === 0 && query.trim().length >= 2 && (
        <p className="text-muted text-center text-xs">{t.noUsersFound}</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map((u) => (
          <UserTierRow
            key={u.id}
            user={u}
            onSetTier={(userId, tier) =>
              setTier(
                userId,
                tier,
                setStatusMsg,
                (newTier) =>
                  setResults((prev) =>
                    prev.map((r) =>
                      r.id === userId ? { ...r, subscriptionTier: newTier } : r,
                    ),
                  ),
                t,
              )
            }
            onSetStatus={(userId, status) =>
              setUserStatus(
                userId,
                status,
                setStatusMsg,
                () =>
                  setResults((prev) =>
                    prev.map((r) => (r.id === userId ? { ...r, status } : r)),
                  ),
                t,
              )
            }
            onResetMfa={(userId) => resetUserMfa(userId, setStatusMsg, t)}
            canResetMfa={canResetMfa}
          />
        ))}
      </div>
    </div>
  );
}

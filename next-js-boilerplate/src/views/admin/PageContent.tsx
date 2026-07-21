"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IconSearch } from "@tabler/icons-react";
import { UserTierRow } from "./UserTierRow";
import {
  onQueryChange,
  setTier,
  type UserResult,
} from "@/lib/admin/admin-utils";
import { PageInfoButton } from "@/components/ui/page-info";
import { adminPageInfo } from "@/constants/page-info";
import { AccessDeniedPage } from "@/features/statics";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export default function PageContent({ className }: { className?: string }) {
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

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

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

      <div className="relative">
        <IconSearch
          size={14}
          stroke={1.5}
          className="text-muted pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
        />
        <input
          type="text"
          value={query}
          onChange={(e) =>
            onQueryChange(e, setQuery, setResults, setSearching, searchTimer)
          }
          placeholder={t.searchPlaceholder}
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
            onSetTier={(userId, tier) => setTier(userId, tier, setStatusMsg)}
          />
        ))}
      </div>
    </div>
  );
}

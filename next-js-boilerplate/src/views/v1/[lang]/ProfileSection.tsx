"use client";

import { useRef, useState } from "react";
import type { ProfileSectionProps } from "@/types/v1/ProfileSection-types";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { IconChevronDown, IconLogout, IconSettings } from "@tabler/icons-react";

export function ProfileSection({ user, logout, lang }: ProfileSectionProps) {
  const t = useMessages("v1-shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="hover:bg-surface-hover flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
      >
        <Avatar
          src={user.avatarUrl}
          fallback={initials(user.name || user.email)}
          className="bg-brand h-8 w-8 shrink-0 text-[11px] text-brand-fg"
        />
        <div className="flex min-w-0 flex-1 flex-col text-sm leading-tight">
          <span className="text-fg truncate font-medium">
            {user.name || "User"}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted truncate text-xs">{user.email}</span>
            {user.tier && (
              <span className="rounded-full border px-1.5 py-0.5 text-[9px] font-medium tracking-wider uppercase">
                {user.tier}
              </span>
            )}
          </div>
        </div>
        <IconChevronDown
          size={16}
          className={`text-muted shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-border bg-surface mt-1 rounded-lg border p-2">
          <Link
            href={`/v1/${lang}/settings/general`}
            onClick={() => setOpen(false)}
            className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm"
          >
            <IconSettings size={16} stroke={1.5} />
            {t.settingsLink}
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="hover:bg-surface-hover text-error mt-1 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <IconLogout size={16} stroke={1.5} />
            {t.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

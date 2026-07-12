"use client";

import { useRef, useState } from "react";
import type { ProfileDropdownProps } from "@/types/v1/ProfileDropdown-types";
import Link from "next/link";
import { useBreakpoint } from "@/hooks";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge as UiBadge } from "@/components/ui/Badge";
import { initials } from "@/lib/initials";
import { createPortal } from "react-dom";
import { IconLogout, IconSettings } from "@tabler/icons-react";

export function ProfileDropdown({
  user,
  logout,
  lang,
  align = "right",
  children,
}: ProfileDropdownProps) {
  const t = useMessages("v1-shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpoint("sm");
  useClickOutside(ref, () => {
    if (isDesktop) setOpen(false);
  });

  const content = (
    <>
      <div className="border-border mb-2 border-b px-2 pb-2">
        <p className="text-fg truncate text-sm font-medium">
          {user.name || "User"}
        </p>
        <p className="text-muted truncate text-xs">{user.email}</p>
        {user.tier && (
          <div className="mt-1">
            <UiBadge variant="secondary">{user.tier}</UiBadge>
          </div>
        )}
      </div>
      <Link
        href={`/v1/${lang}/settings/general`}
        onClick={() => setOpen(false)}
        className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm"
      >
        <IconSettings size={16} stroke={1.5} />
        {t.settingsLink}
      </Link>
      <button
        onClick={() => {
          setOpen(false);
          logout();
        }}
        className="hover:bg-surface-hover mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600"
      >
        <IconLogout size={16} stroke={1.5} />
        {t.signOut}
      </button>
    </>
  );

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((p) => !p)} className="cursor-pointer">
        {children}
      </button>

      {open && isDesktop && (
        <div
          className={`border-border bg-bg absolute top-full z-50 mt-3 w-56 rounded-xl border p-2 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {content}
        </div>
      )}

      {open &&
        !isDesktop &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Decorative dismiss backdrop, not a control — the panel's own controls remain
                keyboard-reachable; this scrim only needs a click target. */}
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold">{t.account}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted hover:bg-surface-hover rounded-lg p-1"
                  aria-label={t.close}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
                {content}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

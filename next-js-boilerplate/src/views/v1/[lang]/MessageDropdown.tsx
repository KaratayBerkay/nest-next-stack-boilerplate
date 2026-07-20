"use client";

import { useMemo, useRef, useState } from "react";
import type { MessageDropdownProps } from "@/types/v1/MessageDropdown-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { createPortal } from "react-dom";
import { IconMail, IconChevronRight, IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { Badge } from "./Badge";

export function MessageDropdown({ conversations, lang }: MessageDropdownProps) {
  const t = useMessages("v1-shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isDesktop = useBreakpoint("sm");
  const unread = useMemo(
    () => conversations.filter((c) => c.unread > 0),
    [conversations],
  );

  useClickOutside(ref, () => {
    if (isDesktop) setOpen(false);
  });

  const content = (
    <>
      <p className="text-muted px-3 py-2 text-xs font-semibold tracking-wider uppercase">
        {t.inbox}
      </p>
      {unread.length === 0 ? (
        <p className="text-muted px-3 py-4 text-center text-xs">{t.noUnread}</p>
      ) : (
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {unread.map((c) => (
            <button
              key={c.user.id}
              onClick={() => {
                setOpen(false);
                router.push(`/v1/${lang}/messages?user=${c.user.id}`);
              }}
              className="hover:bg-surface-hover flex items-center gap-2 rounded-lg px-2 py-2 text-left"
            >
              <Avatar
                fallback={initials(c.user.name)}
                className="bg-brand h-8 w-8 shrink-0 text-[10px] text-brand-fg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate text-sm font-medium">
                  {c.user.name}
                </p>
                <p className="text-muted truncate text-xs">{c.lastMessage}</p>
              </div>
              <span className="bg-error flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                {c.unread > 99 ? "99+" : c.unread}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="border-border border-t">
        <Link
          href={`/v1/${lang}/messages`}
          onClick={() => setOpen(false)}
          className="text-muted hover:bg-surface-hover flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium"
        >
          {t.viewAll}
          <IconChevronRight size={14} stroke={1.5} />
        </Link>
      </div>
    </>
  );

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon={<><IconMail size={20} stroke={1.5} /><Badge count={unread.length} /></>}
        label={t.toggleSidebar}
        onClick={() => setOpen((p) => !p)}
      />

      {open && isDesktop && (
        <div className="border-border bg-bg absolute top-full right-0 z-50 mt-3 w-72 rounded-xl border p-1 shadow-lg">
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
              className="bg-overlay/50 fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold">{t.inbox}</span>
                <IconButton
                  icon={<IconX size={20} stroke={1.5} />}
                  label={t.close}
                  onClick={() => setOpen(false)}
                />
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

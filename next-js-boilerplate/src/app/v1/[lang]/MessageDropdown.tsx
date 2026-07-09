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
import { IconMail, IconChevronRight } from "@tabler/icons-react";
import { Badge } from "./Badge";

export function MessageDropdown({
  conversations,
  lang,
}: MessageDropdownProps) {
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
                className="bg-brand h-8 w-8 shrink-0 text-[10px] text-white"
              />
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate text-sm font-medium">
                  {c.user.name}
                </p>
                <p className="text-muted truncate text-xs">{c.lastMessage}</p>
              </div>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
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
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-muted hover:bg-surface-hover relative rounded-lg p-1.5"
      >
        <IconMail size={20} stroke={1.5} />
        <Badge count={unread.length} />
      </button>

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
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div className="bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold">{t.inbox}</span>
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

import type { BadgeProps } from "@/types/feed/Badge-types";

/** Unread-count dot for icon buttons (bell, inbox) — the single shared copy;
 *  a byte-identical duplicate used to live in views/v1/[lang]/Badge.tsx. */
export function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <span className="ring-bg bg-error text-error-fg absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ring-2">
      {count > 99 ? "99+" : count}
    </span>
  );
}

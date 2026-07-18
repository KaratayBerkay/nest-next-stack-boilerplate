import type { BadgeProps } from "@/types/v1/Badge-types";

export function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <span className="ring-bg absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold text-white ring-2">
      {count > 99 ? "99+" : count}
    </span>
  );
}

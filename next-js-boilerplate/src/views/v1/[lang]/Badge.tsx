import type { BadgeProps } from "@/types/v1/Badge-types";

export function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <span className="ring-bg bg-error absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2">
      {count > 99 ? "99+" : count}
    </span>
  );
}

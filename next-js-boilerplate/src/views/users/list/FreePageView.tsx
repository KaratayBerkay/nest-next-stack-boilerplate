import { cn } from "@/lib/cn";
import Link from "next/link";
import type { FreePageViewProps } from "@/types/users/FreePageView-types";

const USERS = [
  { uuid: "a1b2c3", name: "Alice Johnson", email: "alice@example.com" },
  { uuid: "d4e5f6", name: "Bob Smith", email: "bob@example.com" },
  { uuid: "g7h8i9", name: "Charlie Brown", email: "charlie@example.com" },
];

export async function FreePageView({ t, lang, className }: FreePageViewProps) {
  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-bold">{t.title}</h2>
        <p className="text-muted text-sm">{t.tapToView}</p>
      </div>
      <div
        className="divide-border flex flex-col divide-y rounded-lg border"
        data-testid="users-list"
      >
        {USERS.map((user) => (
          <Link
            key={user.uuid}
            href={`/v1/${lang}/users/detail/${user.uuid}`}
            className="hover:bg-surface-hover flex items-center justify-between px-4 py-3 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-muted text-xs">{user.email}</span>
            </div>
            <span className="text-muted text-xs">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

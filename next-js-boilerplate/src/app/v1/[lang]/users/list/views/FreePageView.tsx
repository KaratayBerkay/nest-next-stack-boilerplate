import Link from "next/link";
import type { Lang } from "@/constants/i18n";
import { getMessages } from "@/lib/i18n/get-messages";

const USERS = [
  { uuid: "a1b2c3", name: "Alice Johnson", email: "alice@example.com" },
  { uuid: "d4e5f6", name: "Bob Smith", email: "bob@example.com" },
  { uuid: "g7h8i9", name: "Charlie Brown", email: "charlie@example.com" },
];

export async function FreePageView({ lang }: { lang: string }) {
  const t = getMessages(lang as Lang, "users");

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold">{t.title}</h2>
        <p className="text-sm text-muted">{t.tapToView}</p>
      </div>
      <div
        className="flex flex-col divide-y divide-border rounded-lg border"
        data-testid="users-list"
      >
        {USERS.map((user) => (
          <Link
            key={user.uuid}
            href={`/v1/${lang}/users/detail/${user.uuid}`}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface-hover"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted">{user.email}</span>
            </div>
            <span className="text-xs text-muted">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

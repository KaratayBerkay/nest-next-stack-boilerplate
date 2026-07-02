import Link from "next/link";
import { Suspense } from "react";
import type { Lang } from "@/constants/i18n";
import { getMessages } from "@/lib/i18n/get-messages";

const USERS: Record<string, { name: string; email: string; role: string }> = {
  a1b2c3: {
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
  },
  d4e5f6: {
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Editor",
  },
  g7h8i9: {
    name: "Charlie Brown",
    email: "charli@example.com",
    role: "Viewer",
  },
};

async function UserDetailContent({
  params,
}: {
  params: Promise<{ lang: string; uuid: string }>;
}) {
  const { lang, uuid } = await params;
  const t = getMessages(lang as Lang, "users");
  const user = USERS[uuid];

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-red-500">{t.userNotFound}</p>
        <Link
          href={`/v1/${lang}/users/list`}
          className="text-brand text-sm underline"
        >
          ← {t.backToUsers}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold">{user.name}</h2>
        <p className="text-muted text-xs" data-testid="user-uuid">
          UUID: {uuid}
        </p>
      </div>
      <div className="border-border flex flex-col gap-3 rounded-lg border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted text-xs">{t.name}</span>
          <span className="text-sm font-medium" data-testid="user-name">
            {user.name}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted text-xs">{t.email}</span>
          <span className="text-sm">{user.email}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted text-xs">{t.role}</span>
          <span className="text-sm">{user.role}</span>
        </div>
      </div>
      <div className="border-border border-t pt-4">
        <p className="text-muted mb-2 text-xs">{t.swipeBack}</p>
        <Link
          href={`/v1/${lang}/users/list`}
          className="text-brand inline-flex items-center gap-1 text-sm font-medium underline hover:no-underline"
        >
          ← {t.backToUsers}
        </Link>
      </div>
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ lang: string; uuid: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-muted animate-pulse text-sm">Loading user...</p>
      }
    >
      <UserDetailContent params={params} />
    </Suspense>
  );
}

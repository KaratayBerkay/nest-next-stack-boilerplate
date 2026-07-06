"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function FreePageView() {
  const params = useParams<{ lang: string }>();
  const t = useMessages("settings");

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h2 className="text-lg font-semibold">{t.privacyHeading}</h2>

      <p className="text-sm text-muted">
        {t.privacySessionsNote}
      </p>

      <Link
        href={`/v1/${params?.lang ?? ""}/settings/sessions`}
        className="text-sm font-medium text-brand hover:underline"
      >
        {t.navSessions}
      </Link>
    </div>
  );
}

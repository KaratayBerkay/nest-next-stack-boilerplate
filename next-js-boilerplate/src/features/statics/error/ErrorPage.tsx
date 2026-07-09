"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { ErrorPageProps } from "@/types/features/statics/ErrorPage-types";

export function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useMessages("error");
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <p className="text-sm text-red-500">{t.somethingWentWrong}</p>
      <p className="text-muted text-xs">{error.message}</p>
      {error.digest ? (
        <p className="text-xs text-zinc-500">
          {t.reference}: <code>{error.digest}</code>
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="bg-surface hover:bg-surface-hover rounded px-3 py-1.5 text-xs"
      >
        {t.tryAgain}
      </button>
    </div>
  );
}

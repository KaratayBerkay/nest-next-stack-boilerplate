"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Button } from "@/components/ui/Button";
import type { ErrorPageProps } from "@/types/features/statics/ErrorPage-types";

export function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useMessages("error");
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <p className="text-error text-sm">{t.somethingWentWrong}</p>
      <p className="text-muted text-xs">{error.message}</p>
      {error.digest ? (
        <p className="text-muted text-xs">
          {t.reference}: <code>{error.digest}</code>
        </p>
      ) : null}
      <Button variant="outline" size="xs" onClick={() => reset()}>
        {t.tryAgain}
      </Button>
    </div>
  );
}

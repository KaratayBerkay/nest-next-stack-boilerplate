"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { NotFoundPageProps } from "@/types/features/statics/NotFoundPage-types";

export function I18nNotFoundPage({
  description,
  backLabel,
  backHref = "/",
}: NotFoundPageProps) {
  const t = useMessages("error");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted">{description ?? t.pageNotFound}</p>
      <Link href={backHref} className="text-brand underline">
        {backLabel ?? t.backHome}
      </Link>
    </div>
  );
}

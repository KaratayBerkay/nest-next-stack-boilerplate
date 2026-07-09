"use client";

import Link from "next/link";
import type { NotFoundPageProps } from "@/types/features/statics/NotFoundPage-types";

export function NotFoundPage({
  title = "404",
  description = "This page could not be found.",
  backLabel = "Go home",
  backHref = "/",
}: NotFoundPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="text-muted">{description}</p>
      <Link href={backHref} className="text-brand underline">
        {backLabel}
      </Link>
    </div>
  );
}

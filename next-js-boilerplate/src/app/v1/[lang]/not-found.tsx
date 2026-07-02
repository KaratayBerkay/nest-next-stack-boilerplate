"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";

// Custom not-found boundary for `/v1/[lang]`. Rendered (with an HTTP 404) when a
// descendant calls notFound() or a non-existent child route is requested. The
// "back" link points at the bare `/v1`, which proxy.ts redirects to the
// negotiated locale.
export default function V1NotFound() {
  const t = useMessages("error");
  return (
    <div data-testid="not-found" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{t.notFound}</h2>
      <p className="text-muted text-sm">{t.v1NotFound}</p>
      <Link href="/v1" className="text-brand self-start underline">
        {t.backToV1}
      </Link>
    </div>
  );
}

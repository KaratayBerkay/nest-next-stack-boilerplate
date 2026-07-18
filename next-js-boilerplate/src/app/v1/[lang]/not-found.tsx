"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { NotFoundPage } from "@/features/statics";

export default function V1NotFound() {
  const t = useMessages("error");
  return (
    <div data-testid="not-found" className="surface flex flex-col gap-2 p-5">
      <NotFoundPage
        title={t.notFound}
        description={t.v1NotFound}
        backLabel={t.backToV1}
        backHref="/v1"
      />
    </div>
  );
}

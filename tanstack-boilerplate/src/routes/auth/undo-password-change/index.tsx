// Ported from next-js-boilerplate/src/app/auth/undo-password-change/page.tsx
import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { UndoPasswordChangeForm } from "@/features/auth/ui/undo-password-change-form";
import { PulseBlockFallback } from "@/fallbacks";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Undo Password Change",
  description: "Restore your previous password",
};

export const Route = createFileRoute("/auth/undo-password-change/")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => metadataToHead(metadata),
  component: UndoPasswordChangePage,
});

function UndoPasswordChangePage() {
  const { token } = Route.useSearch();
  return (
    <Suspense fallback={<PulseBlockFallback />}>
      <UndoPasswordChangeForm token={token ?? ""} />
    </Suspense>
  );
}

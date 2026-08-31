// Ported from next-js-boilerplate/src/app/auth/reset-password/page.tsx
import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/ui/reset-password-form";
import { PulseBlockFallback } from "@/fallbacks";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export const Route = createFileRoute("/auth/reset-password/")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => metadataToHead(metadata),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  return (
    <Suspense fallback={<PulseBlockFallback />}>
      <ResetPasswordForm token={token ?? ""} />
    </Suspense>
  );
}

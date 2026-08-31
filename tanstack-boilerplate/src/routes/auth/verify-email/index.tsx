// Ported from next-js-boilerplate/src/app/auth/verify-email/page.tsx
import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { VerifyEmailForm } from "@/features/auth/ui/verify-email-form";
import { VerifyEmailFallback } from "@/fallbacks";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

interface VerifyEmailSearch {
  token?: string;
  userId?: string;
  email?: string;
}

export const Route = createFileRoute("/auth/verify-email/")({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    userId: typeof search.userId === "string" ? search.userId : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  head: () => metadataToHead(metadata),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token, userId, email } = Route.useSearch();
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm
        token={token ?? ""}
        userId={userId ?? ""}
        email={email ?? ""}
      />
    </Suspense>
  );
}

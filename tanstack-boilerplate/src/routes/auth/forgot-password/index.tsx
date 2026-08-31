// Ported from next-js-boilerplate/src/app/auth/forgot-password/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { Suspense } from "react";
import { ForgotPasswordContent } from "@/views/auth/forgot-password/PageContent";
import { PulseBlockFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export const Route = createFileRoute("/auth/forgot-password/")({
  head: () => metadataToHead(metadata),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <Suspense fallback={<PulseBlockFallback />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

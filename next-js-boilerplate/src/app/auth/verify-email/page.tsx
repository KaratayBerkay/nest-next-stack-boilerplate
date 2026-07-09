import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth/ui/verify-email-form";
import { VerifyEmailFallback } from "@/fallbacks";
import type { VerifyEmailPageProps } from "@/types/auth/VerifyEmailPage-types";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const sp = await searchParams;
  const token = (sp.token as string) ?? "";

  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm token={token} />
    </Suspense>
  );
}

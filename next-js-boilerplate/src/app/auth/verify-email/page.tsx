import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth/ui/verify-email-form";
import type { VerifyEmailPageProps } from "@/types/auth/VerifyEmailPage-types";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const sp = await searchParams;
  const token = (sp.token as string) ?? "";

  return (
    <Suspense
      fallback={
        <div className="bg-surface-hover h-32 w-full animate-pulse rounded" />
      }
    >
      <VerifyEmailForm token={token} />
    </Suspense>
  );
}

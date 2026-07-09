import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth/ui/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-hover h-32 w-full animate-pulse rounded" />
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

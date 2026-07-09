import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/ui/reset-password-form";
import type { ResetPasswordPageProps } from "@/types/auth/ResetPasswordPage-types";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const sp = await searchParams;
  const token = (sp.token as string) ?? "";

  return (
    <Suspense
      fallback={
        <div className="bg-surface-hover h-48 w-full animate-pulse rounded" />
      }
    >
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/ui/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-hover h-48 w-full animate-pulse rounded" />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

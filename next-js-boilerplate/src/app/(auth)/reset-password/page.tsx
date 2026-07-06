import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/ui/reset-password-form";

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

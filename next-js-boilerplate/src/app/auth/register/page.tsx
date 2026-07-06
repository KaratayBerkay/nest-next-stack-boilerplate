import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/ui/register-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense
        fallback={
          <div className="bg-surface-hover h-48 w-full animate-pulse rounded" />
        }
      >
        <RegisterForm />
      </Suspense>
      <Suspense
        fallback={
          <div className="bg-surface-hover h-12 w-full animate-pulse rounded" />
        }
      >
        <SocialLoginButtons />
      </Suspense>
    </div>
  );
}

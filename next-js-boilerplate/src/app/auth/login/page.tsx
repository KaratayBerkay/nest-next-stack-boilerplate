import { Suspense } from "react";
import { LoginForm } from "@/features/auth/ui/login-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense
        fallback={
          <div className="bg-surface-hover h-48 w-full animate-pulse rounded" />
        }
      >
        <LoginForm />
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

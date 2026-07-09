import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/ui/login-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";
import { PulseBlockFallback, PulseSmallBlockFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<PulseBlockFallback />}>
        <LoginForm />
      </Suspense>
      <Suspense fallback={<PulseSmallBlockFallback />}>
        <SocialLoginButtons />
      </Suspense>
    </div>
  );
}

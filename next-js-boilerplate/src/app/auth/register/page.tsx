import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/ui/register-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";
import { PulseBlockFallback, PulseSmallBlockFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<PulseBlockFallback />}>
        <RegisterForm />
      </Suspense>
      <Suspense fallback={<PulseSmallBlockFallback />}>
        <SocialLoginButtons />
      </Suspense>
    </div>
  );
}

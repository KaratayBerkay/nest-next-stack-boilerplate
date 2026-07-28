import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/ui/login-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";
import { PulseBlockFallback, PulseSmallBlockFallback } from "@/fallbacks";
import { getSessionUser } from "@/lib/auth-ssr";
import { getBasePath } from "@/lib/get-base-path";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your account",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(`${await getBasePath()}/feed`);
  }

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

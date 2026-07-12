import { Suspense } from "react";
import { containerClass, SITE } from "@/constants/site";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import { AuthFallback } from "@/fallbacks";
import type { AuthLayoutProps } from "@/types/auth/AuthLayout-types";

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main
      className={`${containerClass} flex min-h-screen flex-col items-center justify-center py-16`}
    >
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-brand text-xs font-semibold tracking-wide uppercase">
            {SITE.name}
          </p>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <Suspense fallback={<AuthFallback />}>
          <section className="surface flex flex-col gap-4 p-6">
            {children}
          </section>
        </Suspense>
      </div>
    </main>
  );
}

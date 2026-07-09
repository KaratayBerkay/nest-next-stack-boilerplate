import { Suspense } from "react";
import { containerClass } from "@/constants/site";
import { AuthStatus } from "@/features/auth/ui/AuthStatus";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import { AuthProvider } from "@/hooks/useAuth";
import { RealtimeProvider } from "@/lib/realtime/RealtimeProvider";
import type { DemosLayoutProps } from "@/types/demos/DemosLayout-types";

export default function DemosLayout({
  children,
}: DemosLayoutProps) {
  return (
    <AuthProvider>
      <Suspense>
      <RealtimeProvider>
      <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Demos</h1>
            <p className="text-muted max-w-xl text-sm">
              Side-by-side rendering comparisons.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AuthStatus />
            <ThemeToggle />
            <LangSwitcher />
          </div>
        </header>
        <section className="surface flex flex-col gap-2 p-5">{children}</section>
      </main>
      </RealtimeProvider>
      </Suspense>
    </AuthProvider>
  );
}

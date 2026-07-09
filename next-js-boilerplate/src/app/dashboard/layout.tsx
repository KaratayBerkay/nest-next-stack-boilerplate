import { containerClass } from "@/constants/site";
import type { DashboardLayoutProps } from "@/types/dashboard/DashboardLayout-types";

// Parallel routes.
//
// The `@team` and `@analytics` folders are named *slots*. Each slot is passed to
// the layout as its own prop (alongside `children`, the implicit slot), so the
// layout renders multiple route subtrees in parallel — each with its own
// loading/error boundary. Here both slots render side by side in one view.
export default function DashboardLayout({
  children,
  team,
  analytics,
}: DashboardLayoutProps) {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted text-xs">
          Two parallel slots (<code>@team</code>, <code>@analytics</code>)
          render together in one layout.
        </p>
      </header>
      {children}
      <div className="grid gap-4 sm:grid-cols-2">
        {team}
        {analytics}
      </div>
    </main>
  );
}

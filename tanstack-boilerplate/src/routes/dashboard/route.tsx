// Ported from next-js-boilerplate/src/app/dashboard/layout.tsx
// (+ the @team and @analytics parallel-route slots, which TanStack renders as
// plain components side by side — same composition, no slot indirection.)
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { containerClass } from "@/constants/site";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function AnalyticsSlot() {
  return (
    <section
      data-testid="slot-analytics"
      className="surface flex flex-col gap-1 p-5"
    >
      <h2 className="text-brand text-sm font-semibold">Analytics</h2>
      <p className="text-muted text-sm">
        Rendered by the <code>@analytics</code> slot.
      </p>
    </section>
  );
}

function TeamSlot() {
  return (
    <section
      data-testid="slot-team"
      className="surface flex flex-col gap-1 p-5"
    >
      <h2 className="text-brand text-sm font-semibold">Team</h2>
      <p className="text-muted text-sm">
        Rendered by the <code>@team</code> slot.
      </p>
    </section>
  );
}

function DashboardLayout() {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted text-xs">
          Two parallel slots (<code>@team</code>, <code>@analytics</code>)
          render together in one layout.
        </p>
      </header>
      <Outlet />
      <div className="grid gap-4 sm:grid-cols-2">
        <TeamSlot />
        <AnalyticsSlot />
      </div>
    </main>
  );
}

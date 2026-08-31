// Ported from next-js-boilerplate/src/app/v1/lang/settings/layout.tsx
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SettingsNav } from "@/components/settings/SettingsNav";

export const Route = createFileRoute("/v1/$lang/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row md:gap-6">
      <SettingsNav />
      <div className="min-w-0 flex-1 border-t pt-4 md:border-t-0 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
}

// Ported from next-js-boilerplate/src/app/v1/lang/ui/layout.tsx
import { Outlet, createFileRoute } from "@tanstack/react-router";
import UILayout from "@/views/ui/UILayout";

export const Route = createFileRoute("/v1/$lang/ui")({
  component: Layout,
});

function Layout() {
  return (
    <UILayout>
      <Outlet />
    </UILayout>
  );
}

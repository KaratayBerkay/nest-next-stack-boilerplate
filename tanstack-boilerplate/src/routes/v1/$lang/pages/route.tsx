// Ported from next-js-boilerplate/src/app/v1/lang/pages/layout.tsx
import { Outlet, createFileRoute } from "@tanstack/react-router";
import PagesLayout from "@/views/pages/PagesLayout";

export const Route = createFileRoute("/v1/$lang/pages")({
  component: Layout,
});

function Layout() {
  return (
    <PagesLayout>
      <Outlet />
    </PagesLayout>
  );
}

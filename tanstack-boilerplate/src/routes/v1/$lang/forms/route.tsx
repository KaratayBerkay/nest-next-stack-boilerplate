// Ported from next-js-boilerplate/src/app/v1/lang/forms/layout.tsx
import { Outlet, createFileRoute } from "@tanstack/react-router";
import FormsLayout from "@/views/forms/FormsLayout";

export const Route = createFileRoute("/v1/$lang/forms")({
  component: Layout,
});

function Layout() {
  return (
    <FormsLayout>
      <Outlet />
    </FormsLayout>
  );
}

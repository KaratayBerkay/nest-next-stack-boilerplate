// Ported from next-js-boilerplate/src/app/gallery/layout.tsx
// The @modal parallel slot + (.)[id] interceptor become navigation-state-aware
// rendering in the $id route (see gallery/$id/index.tsx).
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { containerClass } from "@/constants/site";

export const Route = createFileRoute("/gallery")({
  component: GalleryLayout,
});

function GalleryLayout() {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <Outlet />
    </main>
  );
}

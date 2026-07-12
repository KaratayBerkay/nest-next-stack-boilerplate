import { containerClass } from "@/constants/site";
import type { GalleryLayoutProps } from "@/types/gallery/GalleryLayout-types";

// Intercepting routes pair with a parallel `@modal` slot.
//
// On a *soft* navigation from the gallery, the `@modal/(.)[id]` interceptor
// fills this slot with a modal that overlays the list (the `children` slot
// stays on the gallery). On a *hard* navigation/refresh the interceptor is
// bypassed: `@modal` falls back to its `default.tsx` (null) and `children`
// renders the full `gallery/[id]/page.tsx` instead.
export default function GalleryLayout({ children, modal }: GalleryLayoutProps) {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      {children}
      {modal}
    </main>
  );
}

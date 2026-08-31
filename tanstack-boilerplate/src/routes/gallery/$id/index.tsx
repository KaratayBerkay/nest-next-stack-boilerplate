// Ported from next-js-boilerplate/src/app/gallery/[id]/page.tsx and
// gallery/@modal/(.)[id]/page.tsx.
// Interception semantics: a soft navigation from the gallery list carries
// `galleryModal` in history state, so this route renders the modal OVER the
// list; a hard load (refresh/direct URL) has no state and renders the full
// page — matching Next's (.) interceptor + @modal fallback behavior.
import { createFileRoute, useLocation } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { GalleryList } from "../-gallery-list";

export const metadata: Metadata = {
  title: "Gallery Item",
  description: "View gallery item",
};

export const Route = createFileRoute("/gallery/$id/")({
  head: () => metadataToHead(metadata),
  component: PhotoPage,
});

function PhotoModal({ id }: { id: string }) {
  return (
    <div
      data-testid="photo-modal"
      role="dialog"
      aria-modal="true"
      className="surface flex flex-col gap-2 p-5"
    >
      <h2 className="text-brand text-sm font-semibold">Photo {id} (modal)</h2>
      <p className="text-muted text-sm">
        Intercepted view of <code>/gallery/{id}</code>, rendered over the
        gallery.
      </p>
    </div>
  );
}

function PhotoPage() {
  const { id } = Route.useParams();
  const isModal = useLocation({
    select: (location) =>
      Boolean((location.state as { galleryModal?: boolean }).galleryModal),
  });

  if (isModal) {
    return (
      <>
        <GalleryList />
        <PhotoModal id={id} />
      </>
    );
  }

  return (
    <div data-testid="photo-page" className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Photo {id}</h1>
      <p className="text-muted text-sm">
        Full page for <code>/gallery/{id}</code> (hard navigation / refresh —
        the interceptor is bypassed).
      </p>
    </div>
  );
}

import { Suspense } from "react";
import type {
  ModalContentProps,
  PhotoModalProps,
} from "@/types/gallery/ModalContent-types";
import { LoadingPhotoFallback } from "@/fallbacks";

// Intercepting route: `(.)` matches a segment at the same level as `@modal`'s
// parent (`gallery`), so this intercepts `gallery/[id]` — but only on a soft
// navigation. It renders the photo as a modal in the `@modal` slot, overlaying
// the gallery list that remains in the `children` slot.
async function ModalContent({ params }: ModalContentProps) {
  const { id } = await params;
  return (
    <>
      <h2 className="text-brand text-sm font-semibold">Photo {id} (modal)</h2>
      <p className="text-muted text-sm">
        Intercepted view of <code>/gallery/{id}</code>, rendered over the
        gallery.
      </p>
    </>
  );
}

export default function PhotoModal({ params }: PhotoModalProps) {
  return (
    <div
      data-testid="photo-modal"
      role="dialog"
      aria-modal="true"
      className="surface flex flex-col gap-2 p-5"
    >
      <Suspense fallback={<LoadingPhotoFallback />}>
        <ModalContent params={params} />
      </Suspense>
    </div>
  );
}

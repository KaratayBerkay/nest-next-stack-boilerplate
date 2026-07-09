import type { Metadata } from "next";
import { Suspense } from "react";
import type { PhotoContentProps, PhotoPageProps } from "@/types/gallery/PhotoContent-types";
import { LoadingImageFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Gallery Item",
  description: "View gallery item",
};

async function PhotoContent({ params }: PhotoContentProps) {
  const { id } = await params;
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Photo {id}</h1>
      <p className="text-muted text-sm">
        Full page for <code>/gallery/{id}</code> (hard navigation / refresh —
        the interceptor is bypassed).
      </p>
    </>
  );
}

export default function PhotoPage({
  params,
}: PhotoPageProps) {
  return (
    <div data-testid="photo-page" className="flex flex-col gap-2">
      <Suspense fallback={<LoadingImageFallback />}>
        <PhotoContent params={params} />
      </Suspense>
    </div>
  );
}

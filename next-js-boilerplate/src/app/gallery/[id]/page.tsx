import { Suspense } from "react";

async function PhotoContent({ params }: { params: Promise<{ id: string }> }) {
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
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div data-testid="photo-page" className="flex flex-col gap-2">
      <Suspense
        fallback={
          <p className="text-muted animate-pulse text-sm">Loading...</p>
        }
      >
        <PhotoContent params={params} />
      </Suspense>
    </div>
  );
}

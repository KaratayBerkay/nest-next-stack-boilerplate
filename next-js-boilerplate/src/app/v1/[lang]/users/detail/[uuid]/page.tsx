import { Suspense } from "react";
import { FreePageView } from "./views/FreePageView";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ lang: string; uuid: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-muted animate-pulse text-sm">Loading user...</p>
      }
    >
      <FreePageView params={params} />
    </Suspense>
  );
}

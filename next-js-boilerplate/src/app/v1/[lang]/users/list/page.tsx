import { Suspense } from "react";
import { FreePageView } from "./views/FreePageView";

export default function UsersListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="animate-pulse text-sm text-muted">Loading users...</p>
      }
    >
      <UsersListContent params={params} />
    </Suspense>
  );
}

async function UsersListContent({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return <FreePageView lang={lang} />;
}

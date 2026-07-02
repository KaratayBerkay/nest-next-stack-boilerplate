import { Suspense } from "react";
import { cookies } from "next/headers";

async function DynamicGreeting() {
  const cookieStore = await cookies();
  const name = cookieStore.get("name")?.value ?? "Guest";
  return (
    <p className="text-muted text-sm" data-testid="ppr-greeting">
      Hello, {name}!
    </p>
  );
}

export default function PprPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Partial Prerendering (PPR)
      </h2>
      <p className="text-muted text-sm">
        This static shell is served immediately from the cache. The personalized
        greeting below is streamed at request time.
      </p>
      <Suspense
        fallback={
          <p className="text-sm text-zinc-500">Loading personalization...</p>
        }
      >
        <DynamicGreeting />
      </Suspense>
    </div>
  );
}

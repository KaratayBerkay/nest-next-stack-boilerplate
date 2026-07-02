import { Suspense } from "react";
import { Separator } from "@/components/ui/Separator";

async function Content() {
  return (
    <div className="flex flex-col gap-4" data-testid="separator-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Separator</h2>
        <p className="text-muted text-sm">
          A visual divider for separating content.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Horizontal</h3>
        <p className="text-muted text-sm">Content above separator</p>
        <Separator data-testid="separator-horizontal" />
        <p className="text-muted text-sm">Content below separator</p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Vertical</h3>
        <div className="flex h-12 items-center gap-4">
          <span className="text-muted text-sm">Left</span>
          <Separator
            orientation="vertical"
            className="h-8"
            data-testid="separator-vertical"
          />
          <span className="text-muted text-sm">Right</span>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <Content />
    </Suspense>
  );
}

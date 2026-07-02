import { Suspense } from "react";
import { Badge } from "@/components/ui/Badge";

async function Content() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Badge</h2>
      <p className="text-muted text-sm">
        Displays a badge or a component that looks like a badge.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default" data-testid="badge-default">
            Default
          </Badge>
          <Badge variant="secondary" data-testid="badge-secondary">
            Secondary
          </Badge>
          <Badge variant="outline" data-testid="badge-outline">
            Outline
          </Badge>
          <Badge variant="destructive" data-testid="badge-destructive">
            Destructive
          </Badge>
          <Badge variant="success" data-testid="badge-success">
            Success
          </Badge>
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

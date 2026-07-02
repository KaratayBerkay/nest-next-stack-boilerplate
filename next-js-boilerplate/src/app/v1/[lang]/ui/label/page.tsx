import { Suspense } from "react";
import { Label } from "@/components/ui/Label";

async function Content() {
  return (
    <div className="flex flex-col gap-4" data-testid="label-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Label</h2>
        <p className="text-muted text-sm">
          A form label with optional required indicator.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Label data-testid="label-default">Email</Label>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Required Indicator</h3>
        <Label required data-testid="label-required">
          Full Name
        </Label>
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

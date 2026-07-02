"use client";

import { Switch } from "@/components/ui/Switch";
import { Suspense } from "react";

function Content() {
  return (
    <div className="flex flex-col gap-4" data-testid="switch-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Switch</h2>
        <p className="text-muted text-sm">
          A toggle switch for binary settings.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default (Unchecked)</h3>
        <Switch data-testid="switch-default" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Checked</h3>
        <Switch defaultChecked data-testid="switch-checked" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <Switch disabled data-testid="switch-disabled" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Label</h3>
        <Switch label="Enable notifications" data-testid="switch-labeled" />
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

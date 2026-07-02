import { Suspense } from "react";
import { Input } from "@/components/ui/Input";

async function Content() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Input</h2>
      <p className="text-muted text-sm">
        A text input field for user data entry.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Input data-testid="input-default" className="max-w-sm" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Placeholder</h3>
        <Input
          placeholder="Enter your email"
          data-testid="input-placeholder"
          className="max-w-sm"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <Input
          disabled
          placeholder="Disabled input"
          data-testid="input-disabled"
          className="max-w-sm"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Error State</h3>
        <Input
          error="This field is required"
          defaultValue="Invalid value"
          data-testid="input-error"
          className="max-w-sm"
        />
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

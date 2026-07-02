import { Suspense } from "react";
import { Textarea } from "@/components/ui/Textarea";

async function Content() {
  return (
    <div className="flex flex-col gap-4" data-testid="textarea-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Textarea</h2>
        <p className="text-muted text-sm">A multi-line text input field.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Textarea data-testid="textarea-default" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Placeholder</h3>
        <Textarea
          placeholder="Enter your message..."
          data-testid="textarea-placeholder"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <Textarea
          disabled
          value="This textarea is disabled"
          data-testid="textarea-disabled"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Error</h3>
        <Textarea error="This field is required" data-testid="textarea-error" />
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

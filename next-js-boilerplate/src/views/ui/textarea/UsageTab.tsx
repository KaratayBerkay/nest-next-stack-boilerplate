"use client";

import { Textarea, AutoResizeTextarea } from "@/components/ui/Textarea";

export function UsageTab() {
  return (
    <>
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Default</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Textarea
            data-testid="textarea-default"
            placeholder="Default textarea..."
          />
          <Textarea
            placeholder="Enter your message..."
            data-testid="textarea-placeholder"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <Textarea
          disabled
          value="This textarea is disabled"
          aria-label="Disabled example"
          data-testid="textarea-disabled"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">With Error</h3>
        <Textarea
          error="This field is required"
          aria-label="Error example"
          data-testid="textarea-error"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Auto-Resize</h3>
        <AutoResizeTextarea
          placeholder="Type here and it will grow..."
          data-testid="textarea-auto-resize"
        />
      </section>
    </>
  );
}

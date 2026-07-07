"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

export function PopoverDemo() {
  return (
    <div className="flex flex-col gap-4" data-testid="popover-demo">
      <h2 className="text-xl font-bold">Popover</h2>
      <p className="text-muted text-sm">
        A popover dialog for displaying content on trigger click.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Popover>
          <PopoverTrigger
            data-testid="popover-trigger"
            className="rounded border border-border bg-transparent px-4 py-2 text-sm hover:bg-surface-hover"
          >
            Click to see details
          </PopoverTrigger>
          <PopoverContent data-testid="popover-content">
            <p className="text-sm text-muted">
              This is the popover content. You can put any React nodes here.
            </p>
          </PopoverContent>
        </Popover>
      </section>
    </div>
  );
}

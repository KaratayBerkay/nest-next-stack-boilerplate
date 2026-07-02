"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

export function PopoverDemo() {
  return (
    <div className="flex flex-col gap-4" data-testid="popover-demo">
      <div>
        <h2 className="text-sm font-semibold">Popover</h2>
        <p className="text-muted text-xs">
          A popover dialog for displaying content on trigger click.
        </p>
      </div>

      <div>
        <h3 className="text-muted text-xs font-medium">Default</h3>
        <Popover>
          <PopoverTrigger
            className="border-border rounded px-3 py-1.5 text-sm"
            data-testid="popover-trigger"
          >
            Click to see details
          </PopoverTrigger>
          <PopoverContent data-testid="popover-content">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              This is the popover content. You can put any React nodes here.
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

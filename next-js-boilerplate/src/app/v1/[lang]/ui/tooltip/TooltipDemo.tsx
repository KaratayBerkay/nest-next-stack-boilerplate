"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

export function TooltipDemo() {
  return (
    <div className="flex flex-col gap-4" data-testid="tooltip-demo">
      <div>
        <h2 className="text-sm font-semibold">Tooltip</h2>
        <p className="text-muted text-xs">
          A tooltip that appears on hover with configurable side.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <Tooltip side="top">
          <TooltipTrigger data-testid="tooltip-top">
            <span className="border-border rounded px-3 py-1.5 text-sm">
              Top
            </span>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-top-content">
            Tooltip on top
          </TooltipContent>
        </Tooltip>

        <Tooltip side="bottom">
          <TooltipTrigger data-testid="tooltip-bottom">
            <span className="border-border rounded px-3 py-1.5 text-sm">
              Bottom
            </span>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-bottom-content">
            Tooltip on bottom
          </TooltipContent>
        </Tooltip>

        <Tooltip side="left">
          <TooltipTrigger data-testid="tooltip-left">
            <span className="border-border rounded px-3 py-1.5 text-sm">
              Left
            </span>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-left-content">
            Tooltip on left
          </TooltipContent>
        </Tooltip>

        <Tooltip side="right">
          <TooltipTrigger data-testid="tooltip-right">
            <span className="border-border rounded px-3 py-1.5 text-sm">
              Right
            </span>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-right-content">
            Tooltip on right
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

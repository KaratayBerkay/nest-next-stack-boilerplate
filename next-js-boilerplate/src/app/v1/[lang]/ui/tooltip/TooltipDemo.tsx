"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";

export function TooltipDemo() {
  return (
    <div className="flex flex-col gap-4" data-testid="tooltip-demo">
      <h2 className="text-xl font-bold">Tooltip</h2>
      <p className="text-muted text-sm">
        A tooltip that appears on hover with configurable side.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Sides</h3>
        <div className="flex flex-wrap items-center gap-8">
          <Tooltip side="top">
            <TooltipTrigger asChild data-testid="tooltip-top">
              <Button variant="outline">Top</Button>
            </TooltipTrigger>
            <TooltipContent data-testid="tooltip-top-content">
              Tooltip on top
            </TooltipContent>
          </Tooltip>

          <Tooltip side="bottom">
            <TooltipTrigger asChild data-testid="tooltip-bottom">
              <Button variant="outline">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent data-testid="tooltip-bottom-content">
              Tooltip on bottom
            </TooltipContent>
          </Tooltip>

          <Tooltip side="left">
            <TooltipTrigger asChild data-testid="tooltip-left">
              <Button variant="outline">Left</Button>
            </TooltipTrigger>
            <TooltipContent data-testid="tooltip-left-content">
              Tooltip on left
            </TooltipContent>
          </Tooltip>

          <Tooltip side="right">
            <TooltipTrigger asChild data-testid="tooltip-right">
              <Button variant="outline">Right</Button>
            </TooltipTrigger>
            <TooltipContent data-testid="tooltip-right-content">
              Tooltip on right
            </TooltipContent>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}

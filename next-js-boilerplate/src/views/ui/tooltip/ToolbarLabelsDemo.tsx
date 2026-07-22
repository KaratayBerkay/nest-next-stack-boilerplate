"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";

export function ToolbarLabelsDemo() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <div className="flex flex-wrap items-center gap-8">
          <Tooltip side="top">
            <TooltipTrigger asChild>
              <Button variant="outline">Top</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip on top</TooltipContent>
          </Tooltip>
          <Tooltip side="bottom">
            <TooltipTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip on bottom</TooltipContent>
          </Tooltip>
          <Tooltip side="left">
            <TooltipTrigger asChild>
              <Button variant="outline">Left</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip on left</TooltipContent>
          </Tooltip>
          <Tooltip side="right">
            <TooltipTrigger asChild>
              <Button variant="outline">Right</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip on right</TooltipContent>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}

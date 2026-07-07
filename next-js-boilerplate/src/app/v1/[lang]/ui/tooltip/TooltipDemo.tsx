"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";

export function TooltipDemo() {
  return (
    <div className="flex flex-col gap-4" data-testid="tooltip-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Tooltip</h2>
        <p className="text-muted text-sm">
          A tooltip that appears on hover with configurable side.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Icon Toolbar</h3>
            <div className="surface inline-flex items-center gap-1 p-2">
              <Tooltip side="top">
                <TooltipTrigger asChild>
                  <button className="hover:bg-surface-hover rounded-md p-2 text-muted hover:text-fg" aria-label="Bold">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
              </Tooltip>
              <Tooltip side="top">
                <TooltipTrigger asChild>
                  <button className="hover:bg-surface-hover rounded-md p-2 text-muted hover:text-fg" aria-label="Italic">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" /></svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
              </Tooltip>
              <Tooltip side="top">
                <TooltipTrigger asChild>
                  <button className="hover:bg-surface-hover rounded-md p-2 text-muted hover:text-fg" aria-label="Underline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" /></svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Underline</TooltipContent>
              </Tooltip>
              <Tooltip side="top">
                <TooltipTrigger asChild>
                  <button className="hover:bg-surface-hover rounded-md p-2 text-muted hover:text-fg" aria-label="Strikethrough">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" x2="20" y1="12" y2="12" /></svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Strikethrough</TooltipContent>
              </Tooltip>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

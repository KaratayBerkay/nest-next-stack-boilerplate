"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function TooltipPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Tooltip</h2>
        <p className="text-muted text-sm">
          A tooltip that appears on hover with configurable side and variant.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Shiny</h3>
              <div className="flex flex-wrap items-center gap-8">
                <Tooltip variant="shiny" side="top">
                  <TooltipTrigger asChild>
                    <Button variant="outline">Top</Button>
                  </TooltipTrigger>
                  <TooltipContent variant="shiny">Shiny tooltip</TooltipContent>
                </Tooltip>
                <Tooltip variant="shiny" side="bottom">
                  <TooltipTrigger asChild>
                    <Button variant="outline">Bottom</Button>
                  </TooltipTrigger>
                  <TooltipContent variant="shiny">Shiny tooltip</TooltipContent>
                </Tooltip>
                <Tooltip variant="shiny" side="left">
                  <TooltipTrigger asChild>
                    <Button variant="outline">Left</Button>
                  </TooltipTrigger>
                  <TooltipContent variant="shiny">Shiny tooltip</TooltipContent>
                </Tooltip>
                <Tooltip variant="shiny" side="right">
                  <TooltipTrigger asChild>
                    <Button variant="outline">Right</Button>
                  </TooltipTrigger>
                  <TooltipContent variant="shiny">Shiny tooltip</TooltipContent>
                </Tooltip>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center gap-8">
                  <Tooltip variant="glass" side="top">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Top</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="glass">Glass tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="glass" side="bottom">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Bottom</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="glass">Glass tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="glass" side="left">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Left</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="glass">Glass tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="glass" side="right">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Right</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="glass">Glass tooltip</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center gap-8">
                  <Tooltip variant="neon" side="top">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Top</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="neon">Neon tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="neon" side="bottom">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Bottom</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="neon">Neon tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="neon" side="left">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Left</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="neon">Neon tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="neon" side="right">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Right</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="neon">Neon tooltip</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center gap-8">
                  <Tooltip variant="gradient" side="top">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Top</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="gradient">Gradient tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="gradient" side="bottom">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Bottom</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="gradient">Gradient tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="gradient" side="left">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Left</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="gradient">Gradient tooltip</TooltipContent>
                  </Tooltip>
                  <Tooltip variant="gradient" side="right">
                    <TooltipTrigger asChild>
                      <Button variant="outline">Right</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="gradient">Gradient tooltip</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Form Field Tooltips</h3>
              <div className="surface max-w-sm space-y-4 p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Tooltip side="top">
                      <TooltipTrigger asChild>
                        <button
                          className="text-muted hover:text-fg inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]"
                          aria-label="Email info"
                        >
                          ?
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="shiny">
                        We&apos;ll never share your email.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Tooltip side="top">
                      <TooltipTrigger asChild>
                        <button
                          className="text-muted hover:text-fg inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]"
                          aria-label="Password info"
                        >
                          ?
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="glass">
                        Must be at least 8 characters.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Navigation Tooltips</h3>
              <div className="surface inline-flex items-center gap-1 p-2">
                <Tooltip side="top">
                  <TooltipTrigger asChild>
                    <button
                      className="hover:bg-surface-hover text-muted hover:text-fg rounded-md p-2"
                      aria-label="Bold"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent variant="neon">Bold</TooltipContent>
                </Tooltip>
                <Tooltip side="top">
                  <TooltipTrigger asChild>
                    <button
                      className="hover:bg-surface-hover text-muted hover:text-fg rounded-md p-2"
                      aria-label="Italic"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" x2="10" y1="4" y2="4" />
                        <line x1="14" x2="5" y1="20" y2="20" />
                        <line x1="15" x2="9" y1="4" y2="20" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent variant="neon">Italic</TooltipContent>
                </Tooltip>
                <Tooltip side="top">
                  <TooltipTrigger asChild>
                    <button
                      className="hover:bg-surface-hover text-muted hover:text-fg rounded-md p-2"
                      aria-label="Underline"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 4v6a6 6 0 0 0 12 0V4" />
                        <line x1="4" x2="20" y1="20" y2="20" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent variant="neon">Underline</TooltipContent>
                </Tooltip>
                <Tooltip side="top">
                  <TooltipTrigger asChild>
                    <button
                      className="hover:bg-surface-hover text-muted hover:text-fg rounded-md p-2"
                      aria-label="Strikethrough"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                        <path d="M14 12a4 4 0 0 1 0 8H6" />
                        <line x1="4" x2="20" y1="12" y2="12" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent variant="neon">Strikethrough</TooltipContent>
                </Tooltip>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

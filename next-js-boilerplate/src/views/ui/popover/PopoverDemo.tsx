"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
export function PopoverDemo() {
  const [sortBy, setSortBy] = useState("newest");
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "popular", label: "Most Popular" },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="popover-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Popover</h2>
        <p className="text-muted text-sm">
          A popover dialog for displaying content on trigger click.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Inline Form</TabsTrigger>
          <TabsTrigger value="examples">Profile Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Default</h3>
            <Popover>
              <PopoverTrigger
                data-testid="popover-trigger"
                className="border-border hover:bg-surface-hover rounded border bg-transparent px-4 py-2 text-sm"
              >
                Click to see details
              </PopoverTrigger>
              <PopoverContent data-testid="popover-content">
                <p className="text-muted text-sm">
                  This is the popover content. You can put any React nodes here.
                </p>
              </PopoverContent>
            </Popover>
          </section>
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Sort Filter</h3>
            <Popover>
              <PopoverTrigger className="border-border hover:bg-surface-hover inline-flex items-center gap-2 rounded-lg border bg-transparent px-3 py-2 text-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 18h3" />
                  <path d="M3 6h18" />
                  <path d="M7 12h10" />
                </svg>
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-1">
                  <p className="text-muted mb-1 text-[11px] font-semibold tracking-wider uppercase">
                    Sort by
                  </p>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                        sortBy === opt.value
                          ? "bg-brand/10 text-brand font-medium"
                          : "text-muted hover:text-fg hover:bg-surface-hover"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

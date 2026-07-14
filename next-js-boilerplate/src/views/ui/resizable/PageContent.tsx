"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/Resizable";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Split Editor",
    description: "Two resizable panes with autoSaveId persistence.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <ResizablePanelGroup
            direction="horizontal"
            className="border-border max-w-md rounded-lg border"
          >
            <ResizablePanel defaultSize={50}>
              <div className="flex h-32 items-center justify-center text-sm">
                Left
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-32 items-center justify-center text-sm">
                Right
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Triple Pane",
    description: "Three panes with keyboard-resizable handles.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Triple Pane</h3>
          <ResizablePanelGroup direction="horizontal" className="border-border max-w-md rounded-lg border">
            <ResizablePanel defaultSize={34}>
              <div className="flex h-32 items-center justify-center text-sm">Sidebar</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={33}>
              <div className="flex h-32 items-center justify-center text-sm">Content</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={33}>
              <div className="flex h-32 items-center justify-center text-sm">Details</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
      </div>
    ),
  },
];

export default function ResizablePage() {
  return (
    <ExampleTabs
      title="Resizable"
      intro="A resizable panel container."
      examples={examples}
    />
  );
}

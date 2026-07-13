"use client";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/ContextMenu";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "File Row",
    description: "Right-click context menu with rename, duplicate, and delete.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <ContextMenu>
            <ContextMenuTrigger className="border-border bg-surface flex h-32 w-64 items-center justify-center rounded-md border text-sm">
              Right click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuItem>Edit</ContextMenuItem>
              <ContextMenuItem>Duplicate</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Selection Actions",
    description: "Right-click a text block for contextual actions.",
    render: () => (
      <div className="flex flex-col gap-4"></div>
    ),
  },
];

export default function ContextMenuPage() {
  return (
    <ExampleTabs
      title="Context Menu"
      intro="A right-click context menu."
      examples={examples}
    />
  );
}

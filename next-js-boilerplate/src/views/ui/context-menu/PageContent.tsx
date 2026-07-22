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
import { AnimationsScenario } from "./AnimationsScenario";
import { TextSelectionScenario } from "./TextSelectionScenario";
import { FileTableScenario } from "./FileTableScenario";

function SelectionActionsContent() {
  return (
    <div className="flex flex-col gap-8">
      <AnimationsScenario />
      <TextSelectionScenario />
      <FileTableScenario />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
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
    id: "variants",
    title: "Selection Actions",
    description:
      "Open animations (center pop, left, right, top, bottom) and right-click scenarios.",
    render: () => <SelectionActionsContent />,
  },
];

export default function ContextMenuPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Context Menu"
      intro="A right-click context menu."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

"use client";

import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/Command";
import { Kbd } from "@/components/ui/Kbd";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function QuickSearchTab() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="text-muted mb-2 text-xs">
        Press ↓↑ to navigate, Enter to select
      </p>
      <Command className="border-border w-full">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandGroup heading="Quick Actions">
            <CommandItem value="Create project" onSelect={() => {}}>
              Create project
              <Kbd className="ml-auto">⌘N</Kbd>
            </CommandItem>
            <CommandItem value="Open settings" onSelect={() => {}}>
              Open settings
              <Kbd className="ml-auto">⌘,</Kbd>
            </CommandItem>
            <CommandItem value="Toggle sidebar" onSelect={() => {}}>
              Toggle sidebar
              <Kbd className="ml-auto">⌘B</Kbd>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Pages">
            <CommandItem value="Go to Dashboard" onSelect={() => {}}>
              Go to Dashboard
              <Kbd className="ml-auto">⌘1</Kbd>
            </CommandItem>
            <CommandItem value="Go to Profile" onSelect={() => {}}>
              Go to Profile
              <Kbd className="ml-auto">⌘2</Kbd>
            </CommandItem>
            <CommandItem value="Go to Inbox" onSelect={() => {}}>
              Go to Inbox
              <Kbd className="ml-auto">⌘3</Kbd>
            </CommandItem>
            <CommandItem value="Go to Calendar" onSelect={() => {}}>
              Go to Calendar
              <Kbd className="ml-auto">⌘4</Kbd>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem value="Change theme" onSelect={() => {}}>
              Change theme
              <Kbd className="ml-auto">⌘T</Kbd>
            </CommandItem>
            <CommandItem value="Keyboard shortcuts" onSelect={() => {}}>
              Keyboard shortcuts
              <Kbd className="ml-auto">⌘/</Kbd>
            </CommandItem>
            <CommandItem value="Log out" onSelect={() => {}}>
              Log out
              <Kbd className="ml-auto">⌘⇧Q</Kbd>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

function CommandPaletteTab() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="text-muted mb-2 text-xs">
        Press ↓↑ to navigate, Enter to select
      </p>
      <Command className="border-border w-full">
        <CommandInput placeholder="Type a command…" />
        <CommandList>
          <CommandGroup heading="Navigation">
            <CommandItem value="Go to Dashboard" onSelect={() => {}}>
              Go to Dashboard
              <Kbd className="ml-auto">⌘1</Kbd>
            </CommandItem>
            <CommandItem value="Go to Settings" onSelect={() => {}}>
              Go to Settings
              <Kbd className="ml-auto">⌘2</Kbd>
            </CommandItem>
            <CommandItem value="Go to Profile" onSelect={() => {}}>
              Go to Profile
              <Kbd className="ml-auto">⌘3</Kbd>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem value="Create Project" onSelect={() => {}}>
              Create Project
            </CommandItem>
            <CommandItem value="Invite Team" onSelect={() => {}}>
              Invite Team
            </CommandItem>
            <CommandItem value="Export Data" onSelect={() => {}}>
              Export Data
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent">
            <CommandItem value="Project Alpha" onSelect={() => {}}>
              Project Alpha
            </CommandItem>
            <CommandItem value="Project Beta" onSelect={() => {}}>
              Project Beta
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

function CommandVariantGallery() {
  return (
    <VariantGallery
      variants={["default"]}
      sizes={["sm", "md", "lg"]}
      render={(variant, size) => (
        <div className="flex items-center gap-2">
          <Command className="border-border w-full max-w-40">
            <CommandInput placeholder="Search…" className="h-7 text-xs" />
            <CommandList>
              <CommandItem value="item" onSelect={() => {}} className="text-xs">
                {variant} / {size}
              </CommandItem>
            </CommandList>
          </Command>
        </div>
      )}
    />
  );
}

const examples: UIExample[] = [
  {
    id: "command-examples",
    title: "Command Examples",
    description:
      "Searchable command palette with keyboard navigation, filtering, and groups.",
    render: () => <QuickSearchTab />,
  },
  {
    id: "cmd-k-palette",
    title: "⌘K Palette",
    description:
      "A full-featured command palette with navigation, actions, and recent items.",
    render: () => <CommandPaletteTab />,
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Command component across all theme variants and sizes.",
    render: () => <CommandVariantGallery />,
  },
];

export default function CommandPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Command"
      intro="Searchable command palette with keyboard navigation, filtering, and groups."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

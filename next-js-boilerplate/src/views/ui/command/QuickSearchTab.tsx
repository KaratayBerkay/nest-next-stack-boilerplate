"use client";

import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/Command";
import { Kbd } from "@/components/ui/Kbd";

export function QuickSearchTab() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="text-muted mb-2 text-xs">
        Press ↓↑ to navigate, Enter to select
      </p>
      <Command className="border-border w-full">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              value="Create project"
              onSelect={() => setSelected("Create project")}
            >
              Create project
              <Kbd className="ml-auto">⌘N</Kbd>
            </CommandItem>
            <CommandItem
              value="Open settings"
              onSelect={() => setSelected("Open settings")}
            >
              Open settings
              <Kbd className="ml-auto">⌘,</Kbd>
            </CommandItem>
            <CommandItem
              value="Toggle sidebar"
              onSelect={() => setSelected("Toggle sidebar")}
            >
              Toggle sidebar
              <Kbd className="ml-auto">⌘B</Kbd>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Pages">
            <CommandItem
              value="Go to Dashboard"
              onSelect={() => setSelected("Go to Dashboard")}
            >
              Go to Dashboard
              <Kbd className="ml-auto">⌘1</Kbd>
            </CommandItem>
            <CommandItem
              value="Go to Profile"
              onSelect={() => setSelected("Go to Profile")}
            >
              Go to Profile
              <Kbd className="ml-auto">⌘2</Kbd>
            </CommandItem>
            <CommandItem
              value="Go to Inbox"
              onSelect={() => setSelected("Go to Inbox")}
            >
              Go to Inbox
              <Kbd className="ml-auto">⌘3</Kbd>
            </CommandItem>
            <CommandItem
              value="Go to Calendar"
              onSelect={() => setSelected("Go to Calendar")}
            >
              Go to Calendar
              <Kbd className="ml-auto">⌘4</Kbd>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem
              value="Change theme"
              onSelect={() => setSelected("Change theme")}
            >
              Change theme
              <Kbd className="ml-auto">⌘T</Kbd>
            </CommandItem>
            <CommandItem
              value="Keyboard shortcuts"
              onSelect={() => setSelected("Keyboard shortcuts")}
            >
              Keyboard shortcuts
              <Kbd className="ml-auto">⌘/</Kbd>
            </CommandItem>
            <CommandItem
              value="Log out"
              onSelect={() => setSelected("Log out")}
            >
              Log out
              <Kbd className="ml-auto">⌘⇧Q</Kbd>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      {selected && (
        <p className="text-muted mt-2 text-xs">
          Selected: <span className="text-fg font-medium">{selected}</span>
        </p>
      )}
    </div>
  );
}

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

export function CommandPaletteTab() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="text-muted mb-2 text-xs">
        Press ↓↑ to navigate, Enter to select
      </p>
      <Command className="border-border w-full">
        <CommandInput placeholder="Type a command…" />
        <CommandList>
          <CommandGroup heading="Navigation">
            <CommandItem
              value="Go to Dashboard"
              onSelect={() => setSelected("Go to Dashboard")}
            >
              Go to Dashboard
              <Kbd className="ml-auto">⌘1</Kbd>
            </CommandItem>
            <CommandItem
              value="Go to Settings"
              onSelect={() => setSelected("Go to Settings")}
            >
              Go to Settings
              <Kbd className="ml-auto">⌘2</Kbd>
            </CommandItem>
            <CommandItem
              value="Go to Profile"
              onSelect={() => setSelected("Go to Profile")}
            >
              Go to Profile
              <Kbd className="ml-auto">⌘3</Kbd>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              value="Create Project"
              onSelect={() => setSelected("Create Project")}
            >
              Create Project
            </CommandItem>
            <CommandItem
              value="Invite Team"
              onSelect={() => setSelected("Invite Team")}
            >
              Invite Team
            </CommandItem>
            <CommandItem
              value="Export Data"
              onSelect={() => setSelected("Export Data")}
            >
              Export Data
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent">
            <CommandItem
              value="Project Alpha"
              onSelect={() => setSelected("Project Alpha")}
            >
              Project Alpha
            </CommandItem>
            <CommandItem
              value="Project Beta"
              onSelect={() => setSelected("Project Beta")}
            >
              Project Beta
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

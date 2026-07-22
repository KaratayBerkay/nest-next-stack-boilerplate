"use client";

import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/Command";
import { Kbd } from "@/components/ui/Kbd";

export function CommandPaletteTab() {
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

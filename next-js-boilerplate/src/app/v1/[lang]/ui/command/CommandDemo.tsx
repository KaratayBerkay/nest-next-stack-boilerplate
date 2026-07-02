"use client";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";

export function CommandDemo() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Command</h2>
      <p className="text-muted text-sm">
        A searchable list of commands or options.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Command data-testid="command-default" className="max-w-sm">
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem value="Calendar" data-testid="command-item-calendar">
                Calendar
              </CommandItem>
              <CommandItem value="Search" data-testid="command-item-search">
                Search
              </CommandItem>
              <CommandItem value="Settings" data-testid="command-item-settings">
                Settings
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem value="New File" data-testid="command-item-new-file">
                New File
              </CommandItem>
              <CommandItem value="Copy" data-testid="command-item-copy">
                Copy
              </CommandItem>
              <CommandItem value="Paste" data-testid="command-item-paste">
                Paste
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </section>
    </div>
  );
}

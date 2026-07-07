"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
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
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Command</h2>
        <p className="text-muted text-sm">
          A searchable list of commands or options.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Quick Actions Palette</h3>
            <Command className="max-w-sm">
              <CommandInput placeholder="Type a command..." />
              <CommandList>
                <CommandEmpty>No matching command.</CommandEmpty>
                <CommandGroup heading="Navigate">
                  <CommandItem value="Go to Dashboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
                    Go to Dashboard
                  </CommandItem>
                  <CommandItem value="View Profile">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    View Profile
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Actions">
                  <CommandItem value="New Document">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
                    New Document
                  </CommandItem>
                  <CommandItem value="Export Data">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Export Data
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

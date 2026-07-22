"use client";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/Menubar";

export function ShortcutLabelsTab() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Shortcuts</h3>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <span className="flex flex-1 items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  New File
                </span>
                <kbd className="text-muted ml-4 text-xs">⌘N</kbd>
              </MenubarItem>
              <MenubarItem>
                <span className="flex flex-1 items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                  Open
                </span>
                <kbd className="text-muted ml-4 text-xs">⌘O</kbd>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                <span className="flex flex-1 items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  </svg>
                  Save
                </span>
                <kbd className="text-muted ml-4 text-xs">⌘S</kbd>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <span className="flex flex-1 items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                  Cut
                </span>
                <kbd className="text-muted ml-4 text-xs">⌘X</kbd>
              </MenubarItem>
              <MenubarItem>
                <span className="flex flex-1 items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Copy
                </span>
                <kbd className="text-muted ml-4 text-xs">⌘C</kbd>
              </MenubarItem>
              <MenubarItem>
                <span className="flex flex-1 items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Paste
                </span>
                <kbd className="text-muted ml-4 text-xs">⌘V</kbd>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </section>
    </div>
  );
}

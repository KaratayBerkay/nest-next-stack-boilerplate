"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";

export function DropdownMenuDemo() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Dropdown Menu</h2>
      <p className="text-muted text-sm">
        Displays a menu of actions or options triggered by a button.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="dropdown-trigger"
            className="inline-flex items-center justify-center gap-2 rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            Open Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem data-testid="dropdown-item-profile">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="dropdown-item-settings">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="dropdown-item-help">
              Help
            </DropdownMenuItem>
            <DropdownMenuItem disabled data-testid="dropdown-item-logout">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </div>
  );
}

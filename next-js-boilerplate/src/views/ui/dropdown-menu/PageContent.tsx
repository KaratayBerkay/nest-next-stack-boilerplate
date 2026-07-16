"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function AccountMenuTab() {
  const [selected, setSelected] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setSelected("profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("settings")}>Settings<Kbd className="ml-auto">⌘S</Kbd></DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("shortcuts")}>Keyboard shortcuts<Kbd className="ml-auto">⌘K</Kbd></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSelected("support")}>Support</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("signout")}>Sign out<Kbd className="ml-auto">⇧⌘Q</Kbd></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {selected && <p className="text-muted text-sm">Selected: <span className="font-medium">{selected}</span></p>}
    </div>
  );
}

function DestructiveItemTab() {
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-error" onClick={() => setDeleted(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {deleted && <p className="text-muted text-sm">Item deleted (menu closed automatically).</p>}
    </div>
  );
}

function WithIconsTab() {
  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Help
          </DropdownMenuItem>
          <DropdownMenuItem>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "account-menu",
    title: "Account Menu",
    description: "A standard dropdown menu with account actions and keyboard shortcuts.",
    render: () => <AccountMenuTab />,
  },
  {
    id: "destructive",
    title: "Destructive Item",
    description: "A destructive action using text-error styling. Consumer onClick still closes the menu (dogfoods C5 fix).",
    render: () => <DestructiveItemTab />,
  },
  {
    id: "with-icons",
    title: "With Icons",
    description: "Menu items with leading SVG icons for visual scanning.",
    render: () => <WithIconsTab />,
  },
];

export default function Page({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Dropdown Menu"
      intro="A contextual menu that appears on trigger click. Items close the menu on selection."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

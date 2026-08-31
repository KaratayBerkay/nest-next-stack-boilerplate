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

export function AccountMenuTab() {
  const [selected, setSelected] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setSelected("profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("settings")}>
            Settings<Kbd className="ml-auto">⌘S</Kbd>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("shortcuts")}>
            Keyboard shortcuts<Kbd className="ml-auto">⌘K</Kbd>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSelected("support")}>
            Support
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("signout")}>
            Sign out<Kbd className="ml-auto">⇧⌘Q</Kbd>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {selected && (
        <p className="text-muted text-sm">
          Selected: <span className="font-medium">{selected}</span>
        </p>
      )}
    </div>
  );
}

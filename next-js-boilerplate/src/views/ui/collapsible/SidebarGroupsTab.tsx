"use client";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { Chevron } from "@/views/ui/collapsible/Chevron";

const sidebarSections = [
  {
    key: "files",
    label: "Files",
    defaultOpen: true,
    items: [
      { name: "Documents", count: 24 },
      { name: "Images", count: 156 },
      { name: "Downloads", count: 8 },
    ],
  },
  {
    key: "teams",
    label: "Teams",
    defaultOpen: false,
    items: [
      { name: "Design", count: 6 },
      { name: "Engineering", count: 14 },
      { name: "Marketing", count: 4 },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    defaultOpen: true,
    items: [
      { name: "Profile", count: 0 },
      { name: "Security", count: 2 },
      { name: "Notifications", count: 0 },
    ],
  },
];

export function SidebarGroupsTab() {
  const [openState, setOpenState] = useState<Record<string, boolean>>(
    Object.fromEntries(sidebarSections.map((s) => [s.key, s.defaultOpen])),
  );

  return (
    <div className="flex flex-col gap-4">
      <nav className="bg-surface border-border divide-border w-64 divide-y rounded-lg border">
        {sidebarSections.map((section) => (
          <Collapsible
            key={section.key}
            open={openState[section.key]}
            onOpenChange={(open) =>
              setOpenState((prev) => ({ ...prev, [section.key]: open }))
            }
          >
            <CollapsibleTrigger className="group text-fg flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
              <span>{section.label}</span>
              <Chevron />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col pb-1">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="text-muted hover:bg-surface-hover flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span>{item.name}</span>
                    {item.count > 0 && (
                      <span className="bg-surface-hover text-muted rounded-md px-1.5 py-0.5 text-xs">
                        {item.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
      <p className="text-muted ml-1 text-xs">
        {sidebarSections
          .map((s) => `${s.label}: ${openState[s.key] ? "open" : "closed"}`)
          .join(" | ")}
      </p>
    </div>
  );
}

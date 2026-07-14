"use client";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function SidebarGroups() {
  const [openFiles, setOpenFiles] = useState(true);
  const [openTeams, setOpenTeams] = useState(false);
  const [openSettings, setOpenSettings] = useState(true);

  const files = [
    { name: "Documents", count: 24 },
    { name: "Images", count: 156 },
    { name: "Downloads", count: 8 },
  ];
  const teams = ["Design", "Engineering", "Marketing"];
  const settings = ["Profile", "Security", "Notifications"];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border-border w-64 rounded-lg border">
        <div className="border-border flex flex-col divide-y divide-border">
          <Collapsible open={openFiles} onOpenChange={setOpenFiles}>
            <CollapsibleTrigger className="text-fg hover:bg-surface-hover flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
              <span>Files</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="data-[state=open]:rotate-180 transition-transform duration-200"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="text-muted hover:bg-surface-hover flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span>{file.name}</span>
                    <span className="bg-surface-hover text-muted rounded-md px-1.5 py-0.5 text-xs">
                      {file.count}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openTeams} onOpenChange={setOpenTeams}>
            <CollapsibleTrigger className="text-fg hover:bg-surface-hover flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
              <span>Teams</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="data-[state=open]:rotate-180 transition-transform duration-200"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col">
                {teams.map((team) => (
                  <div
                    key={team}
                    className="text-muted hover:bg-surface-hover px-4 py-2 text-sm"
                  >
                    {team}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSettings} onOpenChange={setOpenSettings}>
            <CollapsibleTrigger className="text-fg hover:bg-surface-hover flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
              <span>Settings</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="data-[state=open]:rotate-180 transition-transform duration-200"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col">
                {settings.map((setting) => (
                  <div
                    key={setting}
                    className="text-muted hover:bg-surface-hover px-4 py-2 text-sm"
                  >
                    {setting}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div className="text-muted ml-1 text-xs">
        Files: {openFiles ? "open" : "closed"} | Teams:{" "}
        {openTeams ? "open" : "closed"} | Settings:{" "}
        {openSettings ? "open" : "closed"}
      </div>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Read More",
    description: "Collapsible section for truncated paragraph content.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Collapsible className="max-w-sm">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              Toggle content
            </CollapsibleTrigger>
            <CollapsibleContent className="text-muted mt-2 text-sm">
              Collapsible content area.
            </CollapsibleContent>
          </Collapsible>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Sidebar Groups",
    description: "Navigation section with collapsible group headers.",
    render: () => <SidebarGroups />,
  },
];

export default function CollapsiblePage() {
  return (
    <ExampleTabs
      title="Collapsible"
      intro="An interactive component that expands/collapses."
      examples={examples}
    />
  );
}

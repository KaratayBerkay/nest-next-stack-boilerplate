"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge, BadgeButton } from "@/components/ui/Badge";

export default function BadgePage() {
  const [notifCount, setNotifCount] = useState(3);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Badge</h2>
        <p className="text-muted text-sm">
          Displays a badge or a component that looks like a badge.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Variants</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default" data-testid="badge-default">
                  Default
                </Badge>
                <Badge variant="secondary" data-testid="badge-secondary">
                  Secondary
                </Badge>
                <Badge variant="outline" data-testid="badge-outline">
                  Outline
                </Badge>
                <Badge variant="destructive" data-testid="badge-destructive">
                  Destructive
                </Badge>
                <Badge variant="success" data-testid="badge-success">
                  Success
                </Badge>
                <Badge variant="warning" data-testid="badge-warning">
                  Warning
                </Badge>
                <Badge variant="error" data-testid="badge-error">
                  Error
                </Badge>
                <Badge variant="info" data-testid="badge-info">
                  Info
                </Badge>
                <Badge variant="soft" data-testid="badge-soft">
                  Soft
                </Badge>
                <Badge variant="dot" data-testid="badge-dot" />
                <Badge variant="pill" data-testid="badge-pill">
                  Pill
                </Badge>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default" className="text-[10px] px-2 py-0">
                  Extra Small
                </Badge>
                <Badge variant="default" className="text-xs px-2.5 py-0.5">
                  Small
                </Badge>
                <Badge variant="default" className="text-sm px-3 py-1">
                  Medium
                </Badge>
                <Badge variant="default" className="text-base px-4 py-1.5">
                  Large
                </Badge>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Button Badges</h3>
              <div className="flex flex-wrap items-center gap-3">
                <BadgeButton
                  variant="default"
                  data-testid="badge-button-default"
                >
                  Clickable
                </BadgeButton>
                <BadgeButton
                  variant="secondary"
                  data-testid="badge-button-secondary"
                >
                  Dismiss
                </BadgeButton>
                <BadgeButton
                  variant="outline"
                  data-testid="badge-button-outline"
                >
                  Add tag
                </BadgeButton>
                <BadgeButton
                  variant="destructive"
                  data-testid="badge-button-destructive"
                >
                  Remove
                </BadgeButton>
                <BadgeButton
                  variant="success"
                  data-testid="badge-button-success"
                >
                  Approve
                </BadgeButton>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Status Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="surface p-4 rounded-xl space-y-2">
                  <p className="text-sm font-medium">Order Status</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">Delivered</Badge>
                    <Badge variant="warning">Processing</Badge>
                    <Badge variant="info">Shipped</Badge>
                    <Badge variant="destructive">Cancelled</Badge>
                  </div>
                </div>
                <div className="surface p-4 rounded-xl space-y-2">
                  <p className="text-sm font-medium">Server Status</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="dot" className="bg-success" />{" "}
                    <span className="text-sm">Online</span>
                    <Badge variant="dot" className="bg-warning" />{" "}
                    <span className="text-sm">Degraded</span>
                    <Badge variant="dot" className="bg-error" />{" "}
                    <span className="text-sm">Offline</span>
                  </div>
                </div>
                <div className="surface p-4 rounded-xl space-y-2">
                  <p className="text-sm font-medium">User Role</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="soft">Admin</Badge>
                    <Badge variant="outline">Editor</Badge>
                    <Badge variant="secondary">Viewer</Badge>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Notification Badges</h3>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  className="relative inline-flex"
                  onClick={() => setNotifCount((c) => (c < 9 ? c + 1 : 0))}
                  aria-label="Notifications"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {notifCount > 0 && (
                    <span className="absolute -top-2 -right-2">
                      <Badge
                        variant="destructive"
                        className="px-1.5 py-0 text-[10px]"
                      >
                        {notifCount}
                      </Badge>
                    </span>
                  )}
                </button>
                <span className="text-muted text-xs">
                  Click bell to increment ({notifCount})
                </span>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Tag Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="surface p-4 rounded-xl space-y-2">
                  <p className="text-sm font-medium">Technology Tags</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">JavaScript</Badge>
                    <Badge variant="default">TypeScript</Badge>
                    <Badge variant="default">React</Badge>
                    <Badge variant="default">Node.js</Badge>
                    <Badge variant="default">Python</Badge>
                  </div>
                </div>
                <div className="surface p-4 rounded-xl space-y-2">
                  <p className="text-sm font-medium">Category Tags</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">API</Badge>
                    <Badge variant="info">REST</Badge>
                    <Badge variant="info">GraphQL</Badge>
                    <Badge variant="info">WebSocket</Badge>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

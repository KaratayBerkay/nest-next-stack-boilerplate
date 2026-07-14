"use client";

import { Badge, BadgeButton } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function SizeScaleTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Size Scale</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="default" size="sm">Small</Badge>
          <Badge variant="default" size="md">Medium</Badge>
          <Badge variant="default" size="lg">Large</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">All Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="soft">Soft</Badge>
          <Badge variant="dot" />
          <Badge variant="pill">Pill</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Button Badges</h3>
        <div className="flex flex-wrap items-center gap-3">
          <BadgeButton variant="default">Clickable</BadgeButton>
          <BadgeButton variant="secondary">Dismiss</BadgeButton>
          <BadgeButton variant="outline">Add tag</BadgeButton>
          <BadgeButton variant="destructive">Remove</BadgeButton>
          <BadgeButton variant="success">Approve</BadgeButton>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Notification Bell</h3>
        <div className="flex items-center gap-3">
          <div className="relative inline-flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute -top-2 -right-2">
              <Badge variant="destructive" size="sm">3</Badge>
            </span>
          </div>
          <span className="text-muted text-xs">3 unread notifications</span>
        </div>
      </section>
    </div>
  );
}

const inboxItems = [
  { name: "Alice Chen", status: "online", subject: "Re: Project update", preview: "Sounds good, let's discuss tomorrow.", time: "2m", unread: true },
  { name: "Bob Kumar", status: "online", subject: "Design review", preview: "Attached the latest mockups for feedback.", time: "15m", unread: true },
  { name: "Carol Smith", status: "away", subject: "Sprint planning", preview: "Can you confirm your availability?", time: "1h", unread: false },
  { name: "Dave Park", status: "offline", subject: "Invoice attached", preview: "Please find the invoice for March attached.", time: "3h", unread: false },
  { name: "Eve Johnson", status: "online", subject: "Deployment notes", preview: "v2.1 is live on staging.", time: "5h", unread: true },
];

function statusColor(status: string) {
  if (status === "online") return "bg-success";
  if (status === "away") return "bg-warning";
  return "bg-border";
}

function InboxListTab() {
  return (
    <div className="surface max-w-lg rounded-xl border shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Inbox</p>
      </div>
      <div className="divide-y divide-border">
        {inboxItems.map((item, i) => (
          <div key={i} className={cn("flex gap-3 px-4 py-3", item.unread && "bg-surface-hover/50")}>
            <div className="relative mt-0.5 shrink-0">
              <div className="bg-surface flex size-9 items-center justify-center rounded-full text-sm font-medium">
                {item.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <span className={cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-bg", statusColor(item.status))} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn("truncate text-sm", item.unread ? "font-semibold" : "text-fg")}>{item.name}</p>
                <span className="text-muted shrink-0 text-xs">{item.time}</span>
              </div>
              <p className={cn("truncate text-sm", item.unread ? "font-medium" : "text-muted")}>{item.subject}</p>
              <p className="text-muted truncate text-xs">{item.preview}</p>
            </div>
            {item.unread && (
              <div className="flex shrink-0 items-start pt-1">
                <span className="mt-0.5 block size-2 rounded-full bg-brand" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavCountsTab() {
  const navItems = [
    { label: "Inbox", count: 12 },
    { label: "Drafts", count: 3 },
    { label: "Sent", count: 0 },
    { label: "Spam", count: 99 },
    { label: "Trash", count: 0 },
    { label: "Archive", count: 0 },
  ];

  return (
    <div className="max-w-sm space-y-4">
      <div className="surface rounded-xl border shadow-sm p-2">
        <p className="text-muted mb-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">Mail</p>
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "hover:bg-surface-hover flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                item.label === "Inbox" && "bg-brand/10 text-brand font-medium",
              )}
            >
              <span>{item.label}</span>
              {item.count > 0 && (
                <Badge
                  variant={item.label === "Spam" ? "warning" : "default"}
                  size="sm"
                >
                  {item.count > 99 ? "99+" : item.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function LiveStatusTab() {
  const statuses = [
    { label: "Production", status: "live", since: "Online for 23d" },
    { label: "Staging", status: "live", since: "Online for 7d" },
    { label: "CI Pipeline", status: "away", since: "Running" },
    { label: "Dev Server", status: "offline", since: "Offline since yesterday" },
  ];

  const statusClass = (s: string) => {
    if (s === "live") return "bg-success shadow-[0_0_6px_2px] shadow-success/50";
    if (s === "away") return "bg-warning";
    return "bg-border";
  };

  const statusLabel = (s: string) => {
    if (s === "live") return "Live";
    if (s === "away") return "Away";
    return "Offline";
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="surface rounded-xl border shadow-sm p-4">
        <p className="text-sm font-semibold mb-3">Server Status</p>
        <div className="space-y-3">
          {statuses.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={cn("size-2.5 rounded-full transition-all duration-1000", statusClass(item.status))} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-muted text-xs">{item.since}</p>
                </div>
              </div>
              <Badge
                variant={item.status === "live" ? "success" : item.status === "away" ? "warning" : "outline"}
                size="sm"
              >
                {statusLabel(item.status)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Size Scale",
    description: "Badge sizes sm/md/lg with all variants and interactive examples.",
    render: () => <SizeScaleTab />,
  },
  {
    id: "inbox",
    title: "Inbox List",
    description: "Unread-count badges and presence dots on contact rows.",
    render: () => <InboxListTab />,
  },
  {
    id: "nav-counts",
    title: "Nav Counts",
    description: "Count badges on navigation items with 99+ overflow.",
    render: () => <NavCountsTab />,
  },
  {
    id: "live-status",
    title: "Live Status",
    description: "Pulsing status dot badges for live/away/offline states.",
    render: () => <LiveStatusTab />,
  },
];

export default function BadgePage() {
  return (
    <ExampleTabs
      title="Badge"
      intro="Displays a badge or a component that looks like a badge."
      examples={examples}
    />
  );
}
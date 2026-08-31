"use client";

import { useState } from "react";
import { IconHash, IconLock, IconMessages } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

type Mode = "channels" | "dms";
type Status = "online" | "away" | "offline";

interface ChannelEntry {
  id: string;
  nameKey: string;
  locked?: boolean;
  unread?: number;
}

interface DmEntry {
  id: string;
  nameKey: string;
  avatar: string;
  status: Status;
  unread?: number;
}

const CHANNELS: ChannelEntry[] = [
  { id: "general", nameKey: "sidebar5Channel1", unread: 3 },
  { id: "design", nameKey: "sidebar5Channel2" },
  { id: "engineering", nameKey: "sidebar5Channel3", unread: 12 },
  { id: "leadership", nameKey: "sidebar5Channel4", locked: true },
];

const DMS: DmEntry[] = [
  {
    id: "avery",
    nameKey: "sidebar5Dm1",
    avatar: "/img/placeholders/ph-1x1-3.webp",
    status: "online",
    unread: 2,
  },
  {
    id: "priya",
    nameKey: "sidebar5Dm2",
    avatar: "/img/placeholders/ph-1x1-4.webp",
    status: "away",
  },
  {
    id: "marco",
    nameKey: "sidebar5Dm3",
    avatar: "/img/placeholders/ph-1x1-5.webp",
    status: "offline",
  },
];

export function ChannelPresenceListSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [mode, setMode] = useState<Mode>("channels");
  const [activeChannel, setActiveChannel] = useState<string | null>("general");
  const [activeDm, setActiveDm] = useState<string | null>(null);

  const activeChannelEntry = CHANNELS.find((c) => c.id === activeChannel);
  const activeDmEntry = DMS.find((d) => d.id === activeDm);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[560px] w-full overflow-hidden rounded-2xl border">
          <aside className="border-border bg-surface flex w-64 shrink-0 flex-col border-r">
            <div className="border-border grid grid-cols-2 gap-1 border-b p-2">
              <button
                type="button"
                aria-pressed={mode === "channels"}
                onClick={() => setMode("channels")}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  mode === "channels"
                    ? "bg-surface-hover text-fg"
                    : "text-muted hover:bg-surface-hover",
                )}
              >
                {sb.sidebar5ModeChannels}
              </button>
              <button
                type="button"
                aria-pressed={mode === "dms"}
                onClick={() => setMode("dms")}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  mode === "dms"
                    ? "bg-surface-hover text-fg"
                    : "text-muted hover:bg-surface-hover",
                )}
              >
                {sb.sidebar5ModeDms}
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
              {mode === "channels"
                ? CHANNELS.map((channel) => {
                    const isActive = channel.id === activeChannel;
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setActiveChannel(channel.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-surface-hover text-fg font-medium"
                            : "text-muted hover:bg-surface-hover",
                        )}
                      >
                        {channel.locked ? (
                          <IconLock size={15} className="shrink-0" />
                        ) : (
                          <IconHash size={15} className="shrink-0" />
                        )}
                        <span className="flex-1 truncate text-left">
                          {sb[channel.nameKey]}
                        </span>
                        {channel.unread ? (
                          <Badge variant="soft" size="sm">
                            {channel.unread}
                          </Badge>
                        ) : null}
                      </button>
                    );
                  })
                : DMS.map((dm) => {
                    const isActive = dm.id === activeDm;
                    return (
                      <button
                        key={dm.id}
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setActiveDm(dm.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-surface-hover text-fg font-medium"
                            : "text-muted hover:bg-surface-hover",
                        )}
                      >
                        <Avatar
                          size="xs"
                          src={dm.avatar}
                          alt={sb[dm.nameKey]}
                          fallback={sb[dm.nameKey].charAt(0)}
                          status={dm.status === "offline" ? undefined : dm.status}
                          className="shrink-0"
                        />
                        <span className="flex-1 truncate text-left">
                          {sb[dm.nameKey]}
                        </span>
                        {dm.unread ? (
                          <Badge variant="soft" size="sm">
                            {dm.unread}
                          </Badge>
                        ) : null}
                      </button>
                    );
                  })}
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mb-3 flex items-center gap-2">
              <IconMessages size={18} className="text-muted" />
              <Typography variant="h3" className="text-lg font-medium">
                {mode === "channels" && activeChannelEntry
                  ? `#${sb[activeChannelEntry.nameKey]}`
                  : mode === "dms" && activeDmEntry
                    ? sb[activeDmEntry.nameKey]
                    : sb.sidebar5SelectPrompt}
              </Typography>
            </div>
            <Typography variant="body" className="text-muted">
              {mode === "channels" && activeChannelEntry
                ? sb.sidebar5ChannelPreviewTemplate.replace(
                    "{name}",
                    sb[activeChannelEntry.nameKey],
                  )
                : mode === "dms" && activeDmEntry
                  ? sb.sidebar5DmPreviewTemplate.replace(
                      "{name}",
                      sb[activeDmEntry.nameKey],
                    )
                  : sb.sidebar5SelectPrompt}
            </Typography>
          </main>
        </div>
      </div>
    </section>
  );
}

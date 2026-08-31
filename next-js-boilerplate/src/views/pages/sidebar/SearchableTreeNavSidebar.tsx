"use client";

import { useMemo, useState } from "react";
import {
  IconChevronRight,
  IconFileText,
  IconFolder,
  IconSearch,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface TreeNode {
  id: string;
  labelKey: string;
  children?: TreeNode[];
}

const TREE: TreeNode[] = [
  {
    id: "getting-started",
    labelKey: "sidebar6NodeGettingStarted",
    children: [
      { id: "installation", labelKey: "sidebar6NodeInstallation" },
      { id: "quick-start", labelKey: "sidebar6NodeQuickStart" },
    ],
  },
  {
    id: "guides",
    labelKey: "sidebar6NodeGuides",
    children: [
      { id: "authentication", labelKey: "sidebar6NodeAuthentication" },
      {
        id: "deployment",
        labelKey: "sidebar6NodeDeployment",
        children: [
          { id: "docker", labelKey: "sidebar6NodeDocker" },
          { id: "vercel", labelKey: "sidebar6NodeVercel" },
        ],
      },
    ],
  },
  {
    id: "reference",
    labelKey: "sidebar6NodeReference",
    children: [
      { id: "api", labelKey: "sidebar6NodeApi" },
      { id: "cli", labelKey: "sidebar6NodeCli" },
    ],
  },
];

function nodeMatches(
  node: TreeNode,
  query: string,
  sb: Record<string, string>,
): boolean {
  if (sb[node.labelKey].toLowerCase().includes(query)) return true;
  return (node.children ?? []).some((child) => nodeMatches(child, query, sb));
}

function collectMatchIds(
  nodes: TreeNode[],
  query: string,
  sb: Record<string, string>,
  acc: Set<string>,
) {
  for (const node of nodes) {
    if (nodeMatches(node, query, sb)) {
      acc.add(node.id);
      if (node.children) collectMatchIds(node.children, query, sb, acc);
    }
  }
}

function TreeList({
  nodes,
  depth,
  sb,
  query,
  matchIds,
  expanded,
  onToggle,
  activeId,
  onSelect,
}: {
  nodes: TreeNode[];
  depth: number;
  sb: Record<string, string>;
  query: string;
  matchIds: Set<string>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  activeId: string;
  onSelect: (node: TreeNode) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {nodes
        .filter((node) => !query || matchIds.has(node.id))
        .map((node) => {
          const hasChildren = Boolean(node.children?.length);
          const isOpen = query ? true : expanded.has(node.id);
          const isActive = node.id === activeId;
          return (
            <div key={node.id}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() =>
                  hasChildren ? onToggle(node.id) : onSelect(node)
                }
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 text-sm transition-colors",
                  isActive
                    ? "bg-surface-hover text-fg font-medium"
                    : "text-muted hover:bg-surface-hover",
                )}
              >
                {hasChildren ? (
                  <IconChevronRight
                    size={14}
                    className={cn(
                      "shrink-0 transition-transform duration-150",
                      isOpen && "rotate-90",
                    )}
                  />
                ) : (
                  <span className="inline-block w-3.5 shrink-0" />
                )}
                {hasChildren ? (
                  <IconFolder size={15} className="shrink-0" />
                ) : (
                  <IconFileText size={15} className="shrink-0" />
                )}
                <span className="truncate text-left">{sb[node.labelKey]}</span>
              </button>
              {hasChildren && isOpen && (
                <TreeList
                  nodes={node.children!}
                  depth={depth + 1}
                  sb={sb}
                  query={query}
                  matchIds={matchIds}
                  expanded={expanded}
                  onToggle={onToggle}
                  activeId={activeId}
                  onSelect={onSelect}
                />
              )}
            </div>
          );
        })}
    </div>
  );
}

export function SearchableTreeNavSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["getting-started"]),
  );
  const [activeNode, setActiveNode] = useState<TreeNode | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const matchIds = useMemo(() => {
    const acc = new Set<string>();
    if (normalizedQuery) collectMatchIds(TREE, normalizedQuery, sb, acc);
    return acc;
  }, [normalizedQuery, sb]);

  const hasResults = !normalizedQuery || matchIds.size > 0;

  const toggleNode = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[560px] w-full overflow-hidden rounded-2xl border">
          <aside className="border-border bg-surface flex w-72 shrink-0 flex-col border-r">
            <div className="border-border shrink-0 border-b p-3">
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={sb.sidebar6SearchPlaceholder}
                leftIcon={<IconSearch size={16} />}
                className="h-9"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {hasResults ? (
                <TreeList
                  nodes={TREE}
                  depth={0}
                  sb={sb}
                  query={normalizedQuery}
                  matchIds={matchIds}
                  expanded={expanded}
                  onToggle={toggleNode}
                  activeId={activeNode?.id ?? ""}
                  onSelect={setActiveNode}
                />
              ) : (
                <p className="text-muted px-3 py-6 text-center text-sm">
                  {sb.sidebar6EmptyStateText}
                </p>
              )}
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tight"
            >
              {activeNode ? sb[activeNode.labelKey] : sb.sidebar6Heading}
            </Typography>
            <Typography variant="body" className="text-muted mt-2">
              {activeNode ? sb.sidebar6Paragraph : sb.sidebar6SelectPrompt}
            </Typography>
          </main>
        </div>
      </div>
    </section>
  );
}

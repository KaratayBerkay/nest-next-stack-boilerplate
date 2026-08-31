"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconChevronDown,
  IconFile,
  IconFilePlus,
  IconFiles,
  IconFolder,
  IconFolderOpen,
  IconGitBranch,
  IconLayoutBottombar,
  IconMenu,
  IconSearch,
  IconSettings,
  IconTerminal2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface ActivityDescriptor {
  icon: typeof IconSearch;
  labelKey: string;
}

type TreeNode =
  | { type: "folder"; name: string; children: TreeNode[] }
  | { type: "file"; name: string };

interface FileTreeProps {
  openFolders: Set<string>;
  setOpenFolders: Dispatch<SetStateAction<Set<string>>>;
  activeFile: string;
  setActiveFile: Dispatch<SetStateAction<string>>;
}

interface TabBarProps extends FileTreeProps {
  t: Record<string, string>;
  panelOpen: boolean;
  setPanelOpen: Dispatch<SetStateAction<boolean>>;
}

const ACTIVITIES: ActivityDescriptor[] = [
  { icon: IconSearch, labelKey: "s9Search" },
  { icon: IconFiles, labelKey: "s9Explorer" },
  { icon: IconGitBranch, labelKey: "s9SourceControl" },
  { icon: IconSettings, labelKey: "s9Settings" },
];

const FOLDER_TREE: TreeNode[] = [
  {
    type: "folder",
    name: "src",
    children: [
      {
        type: "folder",
        name: "components",
        children: [
          { type: "file", name: "button.tsx" },
          { type: "file", name: "input.tsx" },
        ],
      },
      {
        type: "folder",
        name: "pages",
        children: [{ type: "file", name: "index.tsx" }],
      },
      { type: "file", name: "index.ts" },
    ],
  },
  {
    type: "folder",
    name: "public",
    children: [{ type: "file", name: "favicon.ico" }],
  },
  { type: "file", name: "package.json" },
  { type: "file", name: "README.md" },
];

const TAB_FILES = ["index.ts", "button.tsx"] as const;

const BRANCH_NAME = "main";

const DEPTH_PADDING = ["pl-2", "pl-6", "pl-10"] as const;

const CODE_LINES = [
  'import { Button } from "@/components/ui/Button";',
  'import { useState } from "react";',
  "",
  "export function App() {",
  "  const [count, setCount] = useState(0);",
  "",
  "  return (",
  '    <div className="flex flex-col gap-4 p-6">',
  "      <h1>Hello, world</h1>",
  "      <Button onClick={() => setCount(count + 1)}>",
  "        Count: {count}",
  "      </Button>",
  "    </div>",
  "  );",
  "}",
];

function handleActivitySelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function handleFolderToggle(
  name: string,
  setOpen: Dispatch<SetStateAction<Set<string>>>,
) {
  setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    return next;
  });
}

function handleFileSelect(
  name: string,
  setActiveFile: Dispatch<SetStateAction<string>>,
) {
  setActiveFile(name);
}

function handlePanelToggle(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen((open) => !open);
}

function ActivityBar({
  t,
  active,
  setActive,
}: {
  t: Record<string, string>;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="bg-muted/50 border-border flex w-12 shrink-0 flex-col items-center gap-2 border-r py-3">
      {ACTIVITIES.map((activity, index) => {
        const ActivityIcon = activity.icon;
        const isActive = index === active;
        return (
          <button
            key={activity.labelKey}
            type="button"
            aria-label={t[activity.labelKey]}
            aria-pressed={isActive}
            onClick={() => handleActivitySelect(index, setActive)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-surface border-border text-brand border"
                : "text-muted hover:bg-muted/60",
            )}
          >
            <ActivityIcon size={20} />
          </button>
        );
      })}
    </div>
  );
}

function ExplorerHeader({ t }: { t: Record<string, string> }) {
  return (
    <div className="border-border flex h-9 shrink-0 items-center gap-1 border-b px-3">
      <IconChevronDown size={16} className="text-muted" />
      <span className="text-muted flex-1 text-xs font-semibold tracking-wider uppercase">
        {t.s9Explorer}
      </span>
      <button
        type="button"
        aria-label={t.s9NewFile}
        className="text-muted hover:bg-muted/60 rounded p-1 transition-colors"
      >
        <IconFilePlus size={16} />
      </button>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  openFolders,
  setOpenFolders,
  activeFile,
  setActiveFile,
}: {
  node: TreeNode;
  depth: number;
} & FileTreeProps) {
  const padding = DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)];

  if (node.type === "folder") {
    const isOpen = openFolders.has(node.name);
    return (
      <div>
        <button
          type="button"
          onClick={() => handleFolderToggle(node.name, setOpenFolders)}
          className={cn(
            "hover:bg-muted/60 flex w-full items-center gap-1.5 py-1 text-sm transition-colors",
            padding,
          )}
        >
          <IconChevronDown
            size={14}
            className={cn(
              "text-muted shrink-0 transition-transform",
              !isOpen && "-rotate-90",
            )}
          />
          {isOpen ? (
            <IconFolderOpen size={16} className="text-muted shrink-0" />
          ) : (
            <IconFolder size={16} className="text-muted shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && (
          <div>
            {node.children.map((child) => (
              <TreeItem
                key={child.name}
                node={child}
                depth={depth + 1}
                openFolders={openFolders}
                setOpenFolders={setOpenFolders}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = activeFile === node.name;
  return (
    <button
      type="button"
      onClick={() => handleFileSelect(node.name, setActiveFile)}
      className={cn(
        "hover:bg-muted/60 flex w-full items-center gap-1.5 py-1 text-sm transition-colors",
        isActive ? "bg-surface-hover font-medium" : "text-muted",
        padding,
      )}
    >
      <IconFile size={16} className="text-muted shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function FileTree({
  openFolders,
  setOpenFolders,
  activeFile,
  setActiveFile,
}: FileTreeProps) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-0.5 p-2">
        {FOLDER_TREE.map((node) => (
          <TreeItem
            key={node.name}
            node={node}
            depth={0}
            openFolders={openFolders}
            setOpenFolders={setOpenFolders}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function TabBar({
  t,
  activeFile,
  setActiveFile,
  panelOpen,
  setPanelOpen,
  openFolders,
  setOpenFolders,
}: TabBarProps) {
  return (
    <div className="border-border bg-muted/20 flex h-9 shrink-0 items-stretch border-b">
      <div className="flex items-stretch md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.s9OpenMenu}
              className="border-border rounded-none border-r"
            >
              <IconMenu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetTitle className="sr-only">{t.s9MenuTitle}</SheetTitle>
            <ExplorerHeader t={t} />
            <div className="min-h-0 flex-1">
              <FileTree
                openFolders={openFolders}
                setOpenFolders={setOpenFolders}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {TAB_FILES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => handleFileSelect(name, setActiveFile)}
          className={cn(
            "border-border flex items-center gap-1.5 border-r px-3 text-sm transition-colors",
            activeFile === name
              ? "bg-surface border-b-border border-b-2 font-medium"
              : "text-muted hover:bg-muted/30",
          )}
        >
          <IconFile size={14} className="text-muted" />
          {name}
        </button>
      ))}
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon-sm"
        className="self-center"
        aria-label={t.s9TogglePanel}
        onClick={() => handlePanelToggle(setPanelOpen)}
      >
        <IconLayoutBottombar
          size={16}
          className={cn(panelOpen && "text-brand")}
        />
      </Button>
    </div>
  );
}

function EditorPanel() {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="p-4">
        {CODE_LINES.map((line, index) => (
          <div key={index} className="flex gap-4">
            <span className="text-muted/50 w-8 shrink-0 text-right text-xs select-none">
              {index + 1}
            </span>
            <Typography
              variant="body"
              className="text-muted font-mono text-xs whitespace-pre"
            >
              {line}
            </Typography>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function OutputPanel({ t }: { t: Record<string, string> }) {
  return (
    <div className="border-border bg-muted/30 h-24 shrink-0 border-t">
      <div className="border-border flex h-7 items-center gap-1.5 border-b px-3">
        <IconTerminal2 size={14} className="text-muted" />
        <span className="text-muted text-xs font-medium">{t.s9PanelTitle}</span>
      </div>
      <div className="text-muted flex flex-col gap-0.5 p-3 font-mono text-xs">
        <p>{t.s9PanelLine1}</p>
        <p>{t.s9PanelLine2}</p>
      </div>
    </div>
  );
}

function StatusBar({ t }: { t: Record<string, string> }) {
  return (
    <footer className="border-border flex h-7 shrink-0 items-center gap-3 border-t px-3 text-xs">
      <span className="flex items-center gap-1.5 font-medium">
        <IconGitBranch size={14} className="text-muted" />
        {BRANCH_NAME}
      </span>
      <span className="text-muted">{t.s9Language}</span>
      <span className="text-muted ml-auto">{t.s9LineCol}</span>
    </footer>
  );
}

export function WithFileExplorer() {
  const t = useMessages("pages").applicationShell;
  const [activeActivity, setActiveActivity] = useState(1);
  const [openFolders, setOpenFolders] = useState<Set<string>>(
    () => new Set(["src"]),
  );
  const [activeFile, setActiveFile] = useState("index.ts");
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <ActivityBar
              t={t}
              active={activeActivity}
              setActive={setActiveActivity}
            />

            <div className="border-border hidden w-56 shrink-0 flex-col border-r md:flex">
              <ExplorerHeader t={t} />
              <FileTree
                openFolders={openFolders}
                setOpenFolders={setOpenFolders}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <TabBar
                t={t}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
                panelOpen={panelOpen}
                setPanelOpen={setPanelOpen}
                openFolders={openFolders}
                setOpenFolders={setOpenFolders}
              />
              <EditorPanel />
              {panelOpen && <OutputPanel t={t} />}
            </div>
          </div>
          <StatusBar t={t} />
        </div>
      </div>
    </section>
  );
}

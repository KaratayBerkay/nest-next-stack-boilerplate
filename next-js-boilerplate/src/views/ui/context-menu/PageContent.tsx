"use client";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/ContextMenu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { useToast } from "@/components/ui/Toast";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const SAMPLE_TEXT =
  "Right-click this paragraph to see contextual actions. You can copy this text to your clipboard, share it, or delete it.";

const files = [
  { name: "report.pdf", size: "2.4 MB", date: "2026-07-12" },
  { name: "photo.jpg", size: "1.1 MB", date: "2026-07-10" },
  { name: "notes.txt", size: "12 KB", date: "2026-07-08" },
];

function handleCopy(
  text: string,
  toast: ReturnType<typeof useToast>["toast"],
) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: "Text copied to clipboard." });
}

function handleShare(toast: ReturnType<typeof useToast>["toast"]) {
  toast({ title: "Shared", description: "Share link copied to clipboard." });
}

function handleRename(toast: ReturnType<typeof useToast>["toast"]) {
  toast({ title: "Renamed", description: "File renamed successfully." });
}

function handleDuplicate(toast: ReturnType<typeof useToast>["toast"]) {
  toast({ title: "Duplicated", description: "File duplicated successfully." });
}

function TextSelectionScenario() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Text Selection</h3>
      <ContextMenu>
        <ContextMenuTrigger className="border-border bg-surface cursor-pointer select-text rounded-md border p-4 text-sm">
          {SAMPLE_TEXT}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => handleCopy(SAMPLE_TEXT, toast)}>
            Copy
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => handleShare(toast)}>
            Share
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-error"
            onSelect={() => setDeleteDialogOpen(true)}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete text</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this text? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-error text-error-fg hover:bg-error/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function FileTableScenario() {
  const { toast } = useToast();
  const [deleteFile, setDeleteFile] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">File Table Row</h3>
      <div className="border-border overflow-hidden rounded-md border text-sm">
        <div className="bg-surface border-border grid grid-cols-3 border-b px-3 py-2 text-xs font-semibold">
          <span className="text-muted">Name</span>
          <span className="text-muted">Size</span>
          <span className="text-muted">Date</span>
        </div>
        {files.map((file) => (
          <ContextMenu key={file.name}>
            <ContextMenuTrigger asChild>
              <div className="grid cursor-pointer grid-cols-3 border-t border-border px-3 py-2 hover:bg-surface-hover">
                <span>{file.name}</span>
                <span className="text-muted">{file.size}</span>
                <span className="text-muted">{file.date}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>{file.name}</ContextMenuLabel>
              <ContextMenuItem onSelect={() => handleRename(toast)}>
                Rename
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => handleDuplicate(toast)}>
                Duplicate
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="text-error"
                onSelect={() => setDeleteFile(file.name)}
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
      <AlertDialog
        open={deleteFile !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteFile(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteFile}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-error text-error-fg hover:bg-error/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function SelectionActionsContent() {
  return (
    <div className="flex flex-col gap-8">
      <TextSelectionScenario />
      <FileTableScenario />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "File Row",
    description: "Right-click context menu with rename, duplicate, and delete.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <ContextMenu>
            <ContextMenuTrigger className="border-border bg-surface flex h-32 w-64 items-center justify-center rounded-md border text-sm">
              Right click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuItem>Edit</ContextMenuItem>
              <ContextMenuItem>Duplicate</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Selection Actions",
    description: "Right-click a text block for contextual actions.",
    render: () => <SelectionActionsContent />,
  },
];

export default function ContextMenuPage() {
  return (
    <ExampleTabs
      title="Context Menu"
      intro="A right-click context menu."
      examples={examples}
    />
  );
}

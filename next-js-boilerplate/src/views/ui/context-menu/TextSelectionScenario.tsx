"use client";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
import { SAMPLE_TEXT, handleCopy, handleShare } from "./context-menu-data";

export function TextSelectionScenario() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Text Selection</h3>
      <ContextMenu>
        <ContextMenuTrigger className="border-border bg-surface cursor-pointer rounded-md border p-4 text-sm select-text">
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

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
import { files, handleRename, handleDuplicate } from "./context-menu-data";

export function FileTableScenario() {
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
              <div className="border-border hover:bg-surface-hover grid cursor-pointer grid-cols-3 border-t px-3 py-2">
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

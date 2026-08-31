"use client";

import { useEffect, useId, useMemo, type ChangeEvent } from "react";
import { IconFileText, IconPlus, IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ATTACHMENT_ACCEPT } from "@/constants/upload";
import type {
  AttachmentModalProps,
  UploadItem,
} from "@/types/messages/AttachmentModal-types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function handleFileChange(
  e: ChangeEvent<HTMLInputElement>,
  onAddFiles: (files: File[]) => void,
) {
  const files = Array.from(e.target.files ?? []);
  if (files.length > 0) onAddFiles(files);
  e.target.value = "";
}

function itemStatusLabel(
  item: AttachmentModalProps["items"][number],
  t: Record<string, string>,
): string {
  if (item.status === "done") return t.uploaded ?? "Uploaded";
  if (item.status === "error") {
    const base = t.uploadFailed ?? "Upload failed";
    return item.error ? `${base}: ${item.error}` : base;
  }
  return `${t.uploading ?? "Uploading"} ${item.progress}%`;
}

// Owns a blob URL for the image; memoized on the File identity (stable
// across progress ticks — the UploadItem object churns, the File doesn't),
// so previews aren't recreated on every progress update.
function FilePreview({ item }: { item: UploadItem }) {
  const url = useMemo(() => {
    if (!item.file.type.startsWith("image/")) return null;
    return URL.createObjectURL(item.file);
  }, [item.file]);

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  if (url) {
    return (
      <img
        src={url}
        alt={item.file.name}
        className="bg-surface-hover size-12 shrink-0 rounded-md object-cover"
      />
    );
  }
  return (
    <div className="bg-surface-hover text-muted flex size-12 shrink-0 items-center justify-center rounded-md">
      <IconFileText size={20} />
    </div>
  );
}

export function AttachmentModal({
  open,
  items,
  t,
  onSend,
  onRemoveItem,
  onAddFiles,
  onCancel,
}: AttachmentModalProps) {
  const addMoreId = useId();
  const allDone = items.length > 0 && items.every((it) => it.status === "done");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{t.attachmentsTitle ?? "Send attachments"}</DialogTitle>
          <DialogDescription>
            {items.length} {t.files ?? "attachments"}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto">
          <input
            id={addMoreId}
            type="file"
            accept={ATTACHMENT_ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => handleFileChange(e, onAddFiles)}
          />
          <label
            htmlFor={addMoreId}
            className="text-muted hover:bg-surface-hover hover:text-fg flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors"
          >
            <IconPlus size={16} />
            {t.addMore ?? "Add more"}
          </label>
          {items.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-surface border-border flex items-center gap-3 rounded-lg border p-2"
              >
                <FilePreview item={item} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-fg truncate text-sm">
                      {item.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={t.removeAttachment ?? "Remove attachment"}
                      className="text-muted hover:text-error shrink-0 transition-colors"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                  <div className="text-muted text-xs">
                    {formatBytes(item.file.size)}
                  </div>
                  {item.status === "uploading" && (
                    <div className="mt-1">
                      <div className="bg-surface-hover h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className={cn(
                            "bg-brand h-full rounded-full transition-[width] duration-200",
                          )}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "text-xs",
                      item.status === "error"
                        ? "text-error"
                        : item.status === "done"
                          ? "text-brand"
                          : "text-muted",
                    )}
                  >
                    {itemStatusLabel(item, t)}
                  </div>
                </div>
              </div>
            );
          })}
        </DialogBody>
        <DialogFooter>
          <DialogClose variant="ghost">{t.cancel ?? "Cancel"}</DialogClose>
          <Button
            variant="primary"
            size="md"
            disabled={!allDone}
            onClick={onSend}
          >
            {t.send ?? "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

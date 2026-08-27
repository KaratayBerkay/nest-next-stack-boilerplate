"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import type { ConfirmDialogProps } from "@/types/ui/ConfirmDialog-types";

async function handleConfirm(
  onConfirm: () => void | Promise<void>,
  setOpen: (open: boolean) => void,
  setSubmitting: (submitting: boolean) => void,
) {
  setSubmitting(true);
  try {
    await onConfirm();
    setOpen(false);
  } catch {
    // A rejecting onConfirm previously left the dialog exactly as it was —
    // no error shown, and (before this fix) no spinner had even appeared,
    // so a failed destructive action (transient 500, a 403 ownership race)
    // looked completely frozen with no way out but Cancel. Surfacing the
    // failure is the caller's job (each onConfirm already owns its own
    // toast/error UI); this dialog's job is just to stop being stuck.
  } finally {
    setSubmitting(false);
  }
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitting) return;
        setOpen(next);
      }}
    >
      {children(() => setOpen(true))}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={submitting}
            onClick={() => setOpen(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            loading={submitting}
            onClick={() => handleConfirm(onConfirm, setOpen, setSubmitting)}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

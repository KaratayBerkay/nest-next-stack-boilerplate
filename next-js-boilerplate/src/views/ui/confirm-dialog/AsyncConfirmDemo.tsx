"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

function handleAsyncConfirm(
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    setOpen(false);
  }, 2000);
}

function handleAsyncCancel(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen(false);
}

export function AsyncConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setLoading(false);
        setOpen(val);
      }}
    >
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            This action may take a moment. Click Confirm to proceed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleAsyncCancel(setOpen)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => handleAsyncConfirm(setLoading, setOpen)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

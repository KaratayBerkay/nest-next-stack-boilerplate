"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

type PendingTimeoutRef = MutableRefObject<ReturnType<typeof setTimeout> | null>;

function clearPendingTimeout(timeoutRef: PendingTimeoutRef) {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
}

function handleAsyncConfirm(
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
  timeoutRef: PendingTimeoutRef,
) {
  setLoading(true);
  timeoutRef.current = setTimeout(() => {
    setLoading(false);
    setOpen(false);
    timeoutRef.current = null;
  }, 2000);
}

function handleDialogOpenChange(
  open: boolean,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
  timeoutRef: PendingTimeoutRef,
) {
  if (!open) {
    // Cancel, Escape, backdrop click, and the header's close button all
    // route through here, so a pending "Confirm" timeout can't outlive the
    // close and later force-close a dialog the user has since reopened.
    clearPendingTimeout(timeoutRef);
    setLoading(false);
  }
  setOpen(open);
}

export function AsyncConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearPendingTimeout(timeoutRef), []);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) =>
        handleDialogOpenChange(val, setLoading, setOpen, timeoutRef)
      }
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
          <Button
            variant="ghost"
            onClick={() =>
              handleDialogOpenChange(false, setLoading, setOpen, timeoutRef)
            }
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => handleAsyncConfirm(setLoading, setOpen, timeoutRef)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

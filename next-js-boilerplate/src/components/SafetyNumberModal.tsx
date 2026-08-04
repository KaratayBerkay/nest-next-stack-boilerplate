"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button/button";
import type { SafetyNumberModalProps } from "@/types/components/SafetyNumberModal-types";

export function SafetyNumberModal({
  open,
  onOpenChange,
}: SafetyNumberModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Safety Number</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center gap-4">
          <p className="text-muted text-center text-xs">
            Safety numbers are no longer available.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

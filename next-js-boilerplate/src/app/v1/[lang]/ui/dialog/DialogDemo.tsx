"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

export function DialogDemo() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Dialog</h2>
      <p className="text-muted text-sm">
        A modal window that interrupts the user with content.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Dialog>
          <DialogTrigger
            data-testid="dialog-trigger"
            className="inline-flex items-center justify-center rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Open Dialog
          </DialogTrigger>
          <DialogContent data-testid="dialog-content">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                data-testid="dialog-cancel"
                className="inline-flex items-center justify-center rounded border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-surface-hover"
              >
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                data-testid="dialog-confirm"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}

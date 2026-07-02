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
            className="inline-flex items-center justify-center gap-2 rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
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
                className="border-border inline-flex items-center justify-center gap-2 rounded bg-transparent px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </DialogClose>
              <button
                type="button"
                data-testid="dialog-confirm"
                className="inline-flex items-center justify-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
              >
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Dialog</h2>
        <p className="text-muted text-sm">
          A modal window that interrupts the user with content.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Default</h3>
            <Dialog>
              <DialogTrigger
                data-testid="dialog-trigger"
                className="bg-brand inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Open Dialog
              </DialogTrigger>
              <DialogContent data-testid="dialog-content">
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose
                    data-testid="dialog-cancel"
                    className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium"
                  >
                    Cancel
                  </DialogClose>
                  <Button variant="destructive" data-testid="dialog-confirm">
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Delete Confirmation</h3>
            <p className="text-muted mb-2 text-xs">
              Click the button to open a confirmation dialog.
            </p>
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                {deleting ? "Deleting..." : "Delete Project"}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete &ldquo;My Project&rdquo;?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the project and all its data.
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium">
                    Cancel
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleting(true);
                      setTimeout(() => setDeleting(false), 1000);
                    }}
                  >
                    Confirm Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

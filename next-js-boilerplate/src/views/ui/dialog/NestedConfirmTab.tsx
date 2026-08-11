"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogBody,
} from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function NestedConfirmTab() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  function handleDelete() {
    setOpen(false);
    toast({
      title: "Account deleted",
      description: "Your account has been permanently removed.",
      variant: "destructive",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger variant="destructive">Delete Account</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This will permanently delete your account. Are you sure?
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted text-sm">
            All your data will be removed from our servers. This action cannot
            be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <ConfirmDialog
            title="Confirm Deletion"
            description="Are you absolutely sure? This cannot be undone."
            onConfirm={handleDelete}
          >
            {(openDialog) => (
              <Button variant="destructive" onClick={openDialog}>
                Delete
              </Button>
            )}
          </ConfirmDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

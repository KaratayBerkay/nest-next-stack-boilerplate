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

export function NestedConfirmTab() {
  return (
    <Dialog>
      <DialogTrigger className="bg-error text-error-fg focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none">
        Delete Account
      </DialogTrigger>
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
          <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors">
            Cancel
          </DialogClose>
          <ConfirmDialog
            title="Confirm Deletion"
            description="Are you absolutely sure? This cannot be undone."
            onConfirm={() => {}}
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

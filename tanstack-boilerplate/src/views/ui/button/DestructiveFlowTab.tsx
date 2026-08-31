"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast/use-toast";

export function DestructiveFlowTab() {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Destructive Flow</h3>
        <p className="text-muted text-sm">
          Click the button below to trigger a destructive action with
          confirmation.
        </p>
        <div>
          <ConfirmDialog
            title="Delete Account"
            description="This action cannot be undone. All your data will be permanently removed."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => {
              setDeleting(true);
              setTimeout(() => {
                setDeleting(false);
                setDeleted(true);
                toast({
                  title: "Account deleted",
                  description:
                    "Your account has been deleted. This action can be undone for 30 seconds.",
                  variant: "destructive",
                  duration: 30000,
                  action: (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs font-medium"
                      onClick={() => setDeleted(false)}
                    >
                      Undo
                    </Button>
                  ),
                });
              }, 1500);
            }}
          >
            {(open: () => void) => (
              <Button variant="destructive" onClick={open} loading={deleting}>
                Delete Account
              </Button>
            )}
          </ConfirmDialog>
        </div>
        {deleted && (
          <p className="text-error text-xs">
            Account marked as deleted. Click Undo on the toast to restore.
          </p>
        )}
      </section>
    </div>
  );
}

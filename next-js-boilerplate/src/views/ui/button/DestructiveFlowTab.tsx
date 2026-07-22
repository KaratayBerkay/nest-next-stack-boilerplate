"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast/use-toast";

export function DestructiveFlowTab() {
  const [deleting, setDeleting] = useState(false);
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
                toast({
                  title: "Account deleted",
                  description:
                    "Your account has been deleted. This action can be undone for 30 seconds.",
                  variant: "destructive",
                  duration: 10000,
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
      </section>
    </div>
  );
}

"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "destructive-delete",
    title: "Destructive Delete",
    description: "Confirm dialog with destructive variant for permanent actions.",
    render: () => (
      <ConfirmDialog
        title="Delete Account"
        description="This action cannot be undone. Your account and all data will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => {}}
      >
        {(open) => (
          <button
            onClick={open}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete Account
          </button>
        )}
      </ConfirmDialog>
    ),
  },
  {
    id: "lightweight-confirm",
    title: "Lightweight Confirm",
    description: "Simple confirmation prompt for non-destructive actions.",
    render: () => (
      <ConfirmDialog
        title="Leave Channel"
        description="Are you sure you want to leave this channel? You can rejoin later."
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={() => {}}
      >
        {(open) => (
          <button
            onClick={open}
            className="bg-surface hover:bg-surface-hover text-fg rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            Leave Channel
          </button>
        )}
      </ConfirmDialog>
    ),
  },
];

export default function ConfirmDialogPage() {
  return (
    <ExampleTabs
      title="Confirm Dialog"
      intro="A modal dialog that asks for confirmation before performing an action."
      examples={examples}
    />
  );
}

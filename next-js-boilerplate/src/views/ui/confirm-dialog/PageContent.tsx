"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { TypedConfirmationDemo } from "@/views/ui/confirm-dialog/TypedConfirmationDemo";
import { AsyncConfirmDemo } from "@/views/ui/confirm-dialog/AsyncConfirmDemo";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "destructive-delete",
    title: "Destructive Delete",
    description:
      "Confirm dialog with destructive variant for permanent actions.",
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
            className="bg-error text-error-fg rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-90"
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
  {
    id: "typed-confirmation",
    title: "Typed Confirmation",
    description: "Requires typing DELETE to enable the destructive action.",
    render: () => <TypedConfirmationDemo />,
  },
  {
    id: "async-confirm",
    title: "Async Confirm",
    description:
      "Simulates an async operation with a loading spinner on the confirm button.",
    render: () => <AsyncConfirmDemo />,
  },
];

export default function ConfirmDialogPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Confirm Dialog"
      intro="A modal dialog that asks for confirmation before performing an action."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

/* ── Typed Confirmation ── */

function handleTypedInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setInputValue: Dispatch<SetStateAction<string>>,
) {
  setInputValue(e.target.value);
}

function handleTypedCancel(
  setOpen: Dispatch<SetStateAction<boolean>>,
  setInputValue: Dispatch<SetStateAction<string>>,
) {
  setInputValue("");
  setOpen(false);
}

function handleTypedDelete(
  setOpen: Dispatch<SetStateAction<boolean>>,
  setInputValue: Dispatch<SetStateAction<string>>,
) {
  setInputValue("");
  setOpen(false);
}

function TypedConfirmationDemo() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isExactMatch = inputValue === "DELETE";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Account
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. Type{" "}
            <strong>DELETE</strong> to confirm.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Input
            value={inputValue}
            onChange={(e) => handleTypedInputChange(e, setInputValue)}
            placeholder='Type "DELETE" to confirm'
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleTypedCancel(setOpen, setInputValue)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!isExactMatch}
            onClick={() => handleTypedDelete(setOpen, setInputValue)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Async Confirm ── */

function handleAsyncConfirm(
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    setOpen(false);
  }, 2000);
}

function handleAsyncCancel(
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  setOpen(false);
}

function AsyncConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setLoading(false);
        setOpen(val);
      }}
    >
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            This action may take a moment. Click Confirm to proceed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleAsyncCancel(setOpen)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => handleAsyncConfirm(setLoading, setOpen)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Examples ── */

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
            className="rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-error-fg hover:opacity-90"
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
    description: "Simulates an async operation with a loading spinner on the confirm button.",
    render: () => <AsyncConfirmDemo />,
  },
];

export default function ConfirmDialogPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Confirm Dialog"
      intro="A modal dialog that asks for confirmation before performing an action."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

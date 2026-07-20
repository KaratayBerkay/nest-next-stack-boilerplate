"use client";
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const INITIAL_CONTENT =
  "Draft: Project notes\n\n- Update dependencies\n- Review PR #42\n- Deploy to staging";

function handleSave(
  setOriginalText: Dispatch<SetStateAction<string>>,
  text: string,
  toast: ReturnType<typeof useToast>["toast"],
) {
  setOriginalText(text);
  toast({
    title: "Changes saved",
    description: "Your content has been saved.",
    variant: "success",
  });
}

function handleDiscard(
  setText: Dispatch<SetStateAction<string>>,
  originalText: string,
) {
  setText(originalText);
}

function handleCloseClick(
  isDirty: boolean,
  setDialogOpen: Dispatch<SetStateAction<boolean>>,
) {
  if (isDirty) setDialogOpen(true);
}

function UnsavedChangesContent() {
  const [text, setText] = useState(INITIAL_CONTENT);
  const [originalText, setOriginalText] = useState(INITIAL_CONTENT);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const isDirty = text !== originalText;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {isDirty && (
            <span className="bg-warning inline-block h-2 w-2 rounded-full" />
          )}
          Editor
        </span>
        <span className="text-muted text-xs">
          {isDirty ? "Unsaved changes" : "All saved"}
        </span>
      </div>
      <textarea
        className="border-border bg-bg min-h-[120px] w-full rounded border p-3 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => handleCloseClick(isDirty, setDialogOpen)}
        >
          Close
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setText(INITIAL_CONTENT);
            setOriginalText(INITIAL_CONTENT);
          }}
        >
          Reset
        </Button>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error text-error-fg rounded px-4 py-2 text-sm"
              onClick={() => handleDiscard(setText, originalText)}
            >
              Discard
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-brand rounded px-4 py-2 text-sm text-brand-fg"
              onClick={() => handleSave(setOriginalText, text, toast)}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SmallAlertDialogCard() {
  return (
    <div className="surface flex flex-col gap-3 rounded-lg p-4">
      <h3 className="text-sm font-semibold">Small — Simple Confirmation</h3>
      <p className="text-muted text-xs">
        A compact confirmation dialog for quick actions.
      </p>
      <AlertDialog>
        <AlertDialogTrigger className="bg-brand self-start rounded px-4 py-2 text-sm font-medium text-brand-fg hover:opacity-90">
          Delete comment?
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-surface-hover rounded border px-4 py-2 text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-error text-error-fg rounded px-4 py-2 text-sm">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MediumAlertDialogCard() {
  const files = ["report.pdf", "screenshot.png", "backup.zip"];

  return (
    <div className="surface flex flex-col gap-3 rounded-lg p-4">
      <h3 className="text-sm font-semibold">
        Medium — Destructive with Checklist
      </h3>
      <p className="text-muted text-xs">
        A destructive dialog listing the items that will be affected.
      </p>
      <AlertDialog>
        <AlertDialogTrigger className="bg-error text-error-fg self-start rounded px-4 py-2 text-sm font-medium hover:opacity-90">
          Delete 3 files?
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete 3 files?</AlertDialogTitle>
            <AlertDialogDescription>
              The following files will be permanently deleted:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="flex flex-col gap-1.5 px-6 text-sm">
            {files.map((file) => (
              <li key={file} className="flex items-center gap-2">
                <span className="text-muted">&bull;</span>
                <span>{file}</span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-surface-hover rounded border px-4 py-2 text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-error text-error-fg rounded px-4 py-2 text-sm">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LargeAlertDialogCard() {
  return (
    <div className="surface flex flex-col gap-3 rounded-lg p-4">
      <h3 className="text-sm font-semibold">Large — Data Loss Warning</h3>
      <p className="text-muted text-xs">
        A full warning dialog with severity icon and bullet list.
      </p>
      <AlertDialog>
        <AlertDialogTrigger className="bg-error text-error-fg self-start rounded px-4 py-2 text-sm font-medium hover:opacity-90">
          Delete account
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="bg-error/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full sm:mx-0">
              <svg
                className="text-error h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <AlertDialogTitle>Warning: irreversible action</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="flex flex-col gap-1.5 px-6 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-error">&bull;</span>
              <span>Personal profile and settings</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-error">&bull;</span>
              <span>All posts, comments, and messages</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-error">&bull;</span>
              <span>Billing history and subscription data</span>
            </li>
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-surface-hover rounded border px-4 py-2 text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-error text-error-fg rounded px-4 py-2 text-sm">
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SizeScaleContent() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SmallAlertDialogCard />
      <MediumAlertDialogCard />
      <LargeAlertDialogCard />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Delete Account",
    description: "Destructive alert dialog with initial focus on Cancel.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <AlertDialog>
            <AlertDialogTrigger className="bg-brand rounded px-4 py-2 text-sm font-medium text-brand-fg hover:opacity-90">
              Open Alert Dialog
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border hover:bg-surface-hover rounded border px-4 py-2 text-sm">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction className="bg-error text-error-fg rounded px-4 py-2 text-sm">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    ),
  },
  {
    id: "unsaved-changes",
    title: "Unsaved Changes",
    description: "Leave or stay prompt when there are unsaved changes.",
    render: () => <UnsavedChangesContent />,
  },
  {
    id: "size-scale",
    title: "Size Scale",
    description:
      "Alert dialogs at small, medium, and large sizes with varying complexity.",
    render: () => <SizeScaleContent />,
  },
];

export default function AlertDialogPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Alert Dialog"
      intro="A modal dialog that interrupts the user."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

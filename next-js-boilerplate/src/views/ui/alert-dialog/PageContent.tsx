"use client";
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
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Delete Account",
    description: "Destructive alert dialog with initial focus on Cancel.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <AlertDialog>
            <AlertDialogTrigger className="bg-brand rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90">
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
                <AlertDialogAction className="rounded bg-red-600 px-4 py-2 text-sm text-white">
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
    id: "examples",
    title: "Unsaved Changes",
    description: "Leave or stay prompt when there are unsaved changes.",
    render: () => (
      <div className="flex flex-col gap-4"></div>
    ),
  },
];

export default function AlertDialogPage() {
  return (
    <ExampleTabs
      title="Alert Dialog"
      intro="A modal dialog that interrupts the user."
      examples={examples}
    />
  );
}

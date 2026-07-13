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
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function handleDelete(setDeleting: (v: boolean) => void) {
  setDeleting(true);
  setTimeout(() => setDeleting(false), 1000);
}

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-6">
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

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Different Content</h3>
        <Dialog>
          <DialogTrigger className="bg-brand inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Open Form Dialog
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <input
                  id="name"
                  defaultValue="John Doe"
                  className="border-border bg-bg rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  defaultValue="john@example.com"
                  className="border-border bg-bg rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium">
                Cancel
              </DialogClose>
              <Button variant="primary">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}

function ExamplesTab() {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Confirmation Dialog</h3>
        <p className="text-muted text-xs">
          A destructive confirmation dialog.
        </p>
        <Dialog>
          <DialogTrigger className="bg-brand inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            {deleting ? "Deleting..." : "Delete Project"}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete &ldquo;My Project&rdquo;?
              </DialogTitle>
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
                onClick={() => handleDelete(setDeleting)}
              >
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Form Dialog</h3>
        <p className="text-muted text-xs">
          A form dialog for editing content.
        </p>
        <Dialog>
          <DialogTrigger className="bg-brand inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Edit Settings
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Settings</DialogTitle>
              <DialogDescription>
                Update your notification preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded" />
                Email notifications
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Push notifications
              </label>
            </div>
            <DialogFooter>
              <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium">
                Cancel
              </DialogClose>
              <Button variant="primary">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Info Dialog</h3>
        <p className="text-muted text-xs">
          An informational dialog with details.
        </p>
        <Dialog>
          <DialogTrigger className="bg-brand inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            View Details
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Version 2.0 Released</DialogTitle>
              <DialogDescription>
                We&apos;re excited to announce the release of version 2.0 with
                new features including dark mode, improved performance, and
                a completely redesigned interface.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-surface p-3 text-sm">
              <p className="font-medium">What&apos;s New</p>
              <ul className="text-muted mt-1 list-inside list-disc text-xs">
                <li>Dark mode support</li>
                <li>3x faster load times</li>
                <li>Redesigned dashboard</li>
              </ul>
            </div>
            <DialogFooter>
              <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium">
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "components",
    title: "Edit Profile",
    description: "Dialog with a form, footer actions pinned at the bottom.",
    render: () => <ComponentsTab />,
  },
  {
    id: "examples",
    title: "Size Scale",
    description: "Dialog size variants: sm, md, lg, and full.",
    render: () => <ExamplesTab />,
  },
];

export default function Page() {
  return (
    <ExampleTabs
      title="Dialog"
      intro="A modal window that interrupts the user with content."
      examples={examples}
    />
  );
}

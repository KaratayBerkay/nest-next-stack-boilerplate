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
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const inputClass = "border-border bg-bg rounded-md border px-3 py-2 text-sm focus-visible:ring-brand focus-visible:border-brand focus-visible:ring-2 focus-visible:outline-none";

function EditProfileTab() {
  return (
    <Dialog>
      <DialogTrigger className="bg-brand text-brand-fg hover:opacity-90 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">
        Edit Profile
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input id="name" defaultValue="John Doe" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" defaultValue="john@example.com" className={inputClass} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors">
            Cancel
          </DialogClose>
          <Button variant="primary">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SizeScaleTab() {
  const sizes = ["sm", "md", "lg", "full"] as const;

  return (
    <div className="flex flex-wrap gap-3">
      {sizes.map((s) => (
        <Dialog key={s}>
          <DialogTrigger className="border-border bg-transparent hover:bg-surface-hover inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">
            {s}
          </DialogTrigger>
          <DialogContent size={s}>
            <DialogHeader>
              <DialogTitle>Size: {s}</DialogTitle>
              <DialogDescription>
                This dialog uses the &ldquo;{s}&rdquo; size preset.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-muted text-sm">Content area with scroll-fade treatment.</p>
            </DialogBody>
            <DialogFooter>
              <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors">
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

function TermsScrollTab() {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className="bg-brand text-brand-fg hover:opacity-90 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">
        View Terms of Service
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read the following terms carefully before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="text-muted flex flex-col gap-3 text-sm">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>
            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
            <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors">
            Decline
          </DialogClose>
          <Button variant="primary" disabled={accepted} onClick={() => setAccepted(true)}>
            {accepted ? "Accepted" : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NestedConfirmTab() {
  return (
    <Dialog>
      <DialogTrigger className="bg-error text-error-fg hover:opacity-90 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">
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
            All your data will be removed from our servers. This action cannot be undone.
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

const examples: UIExample[] = [
  {
    id: "edit-profile",
    title: "Edit Profile",
    description: "Dialog with a form and pinned header/footer actions.",
    render: () => <EditProfileTab />,
  },
  {
    id: "size-scale",
    title: "Size Scale",
    description: "Dialog size variants: sm, md, lg, and full.",
    render: () => <SizeScaleTab />,
  },
  {
    id: "terms-scroll",
    title: "Terms Scroll",
    description: "Long form body with pinned header and footer. Body scrolls with scroll-fade treatment.",
    render: () => <TermsScrollTab />,
  },
  {
    id: "nested-confirm",
    title: "Nested Confirm",
    description: "Dialog containing a confirm-dialog. Escape closes only the top layer.",
    render: () => <NestedConfirmTab />,
  },
];

export default function Page() {
  return (
    <ExampleTabs
      title="Dialog"
      intro="A modal window that interrupts the user with content. Header and footer are pinned; body scrolls independently."
      examples={examples}
    />
  );
}

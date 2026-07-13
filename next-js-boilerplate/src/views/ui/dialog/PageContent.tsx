"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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

function handleDelete(setDeleting: (v: boolean) => void) {
  setDeleting(true);
  setTimeout(() => setDeleting(false), 1000);
}

export default function Page() {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Dialog</h2>
        <p className="text-muted text-sm">
          A modal window that interrupts the user with content.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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
              <h3 className="text-lg font-semibold">Shiny</h3>
              <Dialog>
                <DialogTrigger className="bg-gradient-to-br from-slate-900 to-slate-950 inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90 shadow-lg">
                  Open Shiny Dialog
                </DialogTrigger>
                <DialogContent variant="shiny">
                  <DialogHeader>
                    <DialogTitle>Shiny Dialog</DialogTitle>
                    <DialogDescription>
                      This dialog uses the shiny variant with a gradient background
                      and enhanced shadow effects.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium">
                      Cancel
                    </DialogClose>
                    <Button variant="primary">Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                <Dialog>
                  <DialogTrigger className="bg-white/10 backdrop-blur-md inline-flex items-center justify-center rounded border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                    Open Glass Dialog
                  </DialogTrigger>
                  <DialogContent variant="glass">
                    <DialogHeader>
                      <DialogTitle className="text-white">Glass Dialog</DialogTitle>
                      <DialogDescription className="text-slate-300">
                        This dialog uses the glass variant with a frosted glass
                        effect and translucent background.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose className="border-white/20 hover:bg-white/10 inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium text-white">
                        Cancel
                      </DialogClose>
                      <Button variant="primary">Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="rounded-xl bg-slate-950 p-6">
                <Dialog>
                  <DialogTrigger className="bg-cyan-500/20 inline-flex items-center justify-center rounded border border-cyan-500/30 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    Open Neon Dialog
                  </DialogTrigger>
                  <DialogContent variant="neon">
                    <DialogHeader>
                      <DialogTitle className="text-cyan-300">Neon Dialog</DialogTitle>
                      <DialogDescription className="text-cyan-400/70">
                        This dialog uses the neon variant with glowing cyan accents
                        and a dark background.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose className="border-cyan-500/30 hover:bg-cyan-500/10 inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium text-cyan-400">
                        Cancel
                      </DialogClose>
                      <Button variant="primary">Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <Dialog>
                <DialogTrigger className="bg-gradient-to-br from-slate-900 to-slate-950 inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 shadow-2xl border border-transparent">
                  Open Gradient Dialog
                </DialogTrigger>
                <DialogContent variant="gradient">
                  <DialogHeader>
                    <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                      Gradient Dialog
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      This dialog uses the gradient variant with text gradient effects
                      and a deep gradient background.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium">
                      Cancel
                    </DialogClose>
                    <Button variant="primary">Confirm</Button>
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
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Confirmation Dialog (Neon)</h3>
              <p className="text-muted text-xs">
                A destructive confirmation dialog with neon styling.
              </p>
              <div className="rounded-xl bg-slate-950 p-6">
                <Dialog>
                  <DialogTrigger className="bg-red-600/20 inline-flex items-center justify-center rounded border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-600/30">
                    {deleting ? "Deleting..." : "Delete Project"}
                  </DialogTrigger>
                  <DialogContent variant="neon">
                    <DialogHeader>
                      <DialogTitle className="text-cyan-300">
                        Delete &ldquo;My Project&rdquo;?
                      </DialogTitle>
                      <DialogDescription className="text-cyan-400/70">
                        This will permanently delete the project and all its data.
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose className="border-cyan-500/30 hover:bg-cyan-500/10 inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium text-cyan-400">
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
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Form Dialog (Glass)</h3>
              <p className="text-muted text-xs">
                A form dialog with glass styling for editing content.
              </p>
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                <Dialog>
                  <DialogTrigger className="bg-white/10 backdrop-blur-md inline-flex items-center justify-center rounded border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                    Edit Settings
                  </DialogTrigger>
                  <DialogContent variant="glass">
                    <DialogHeader>
                      <DialogTitle className="text-white">Edit Settings</DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Update your notification preferences.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Email notifications
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input type="checkbox" className="rounded" />
                        Push notifications
                      </label>
                    </div>
                    <DialogFooter>
                      <DialogClose className="border-white/20 hover:bg-white/10 inline-flex items-center justify-center rounded border bg-transparent px-4 py-2 text-sm font-medium text-white">
                        Cancel
                      </DialogClose>
                      <Button variant="primary">Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Info Dialog (Shiny)</h3>
              <p className="text-muted text-xs">
                An informational dialog with shiny styling.
              </p>
              <Dialog>
                <DialogTrigger className="bg-gradient-to-br from-slate-900 to-slate-950 inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white hover:opacity-90 shadow-lg">
                  View Details
                </DialogTrigger>
                <DialogContent variant="shiny">
                  <DialogHeader>
                    <DialogTitle>Version 2.0 Released</DialogTitle>
                    <DialogDescription>
                      We&apos;re excited to announce the release of version 2.0 with
                      new features including dark mode, improved performance, and
                      a completely redesigned interface.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg bg-white/5 p-3 text-sm">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

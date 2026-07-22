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
import { Button } from "@/components/ui/Button";

const inputClass =
  "border-border bg-bg rounded-md border px-3 py-2 text-sm focus-visible:ring-brand focus-visible:border-brand focus-visible:ring-2 focus-visible:outline-none";

export function EditProfileTab() {
  return (
    <Dialog>
      <DialogTrigger className="bg-brand text-brand-fg focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none">
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
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input id="name" defaultValue="John Doe" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                defaultValue="john@example.com"
                className={inputClass}
              />
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

"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import type { ToastOptions } from "@/types/ui/Toast-types";

function handleSave(
  setOpen: Dispatch<SetStateAction<boolean>>,
  toast: (options: ToastOptions) => void,
) {
  setOpen(false);
  toast({
    title: "Profile saved",
    description: "Your changes have been saved.",
    variant: "success",
  });
}

export function EditProfileTab() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger variant="primary">Edit Profile</DialogTrigger>
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="john@example.com" />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose variant="outline">Cancel</DialogClose>
          <Button variant="primary" onClick={() => handleSave(setOpen, toast)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

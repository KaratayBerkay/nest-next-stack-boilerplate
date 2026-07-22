"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

export function TypedConfirmationDemo() {
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
          <Button
            variant="ghost"
            onClick={() => handleTypedCancel(setOpen, setInputValue)}
          >
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

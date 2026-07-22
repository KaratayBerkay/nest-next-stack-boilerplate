"use client";

import {
  useState,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { UploadFile } from "@/types/ui/FileUpload-types";

function handleSave(
  e: FormEvent,
  setSaving: Dispatch<SetStateAction<boolean>>,
  setSuccess: Dispatch<SetStateAction<boolean>>,
) {
  e.preventDefault();
  setSaving(true);
  setSuccess(false);
  setTimeout(() => {
    setSaving(false);
    setSuccess(true);
  }, 1500);
}

export function ProfileFormTab() {
  const [avatar, setAvatar] = useState<UploadFile[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <form
      className="flex max-w-sm flex-col gap-4"
      onSubmit={(e) => handleSave(e, setSaving, setSuccess)}
    >
      <p className="text-muted text-xs">
        A composed profile form: avatar upload, name fields, and save with
        loading state.
      </p>
      <div className="flex items-center gap-4">
        <ImageUpload avatar value={avatar} onChange={setAvatar} />
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-first-name">First name</Label>
            <Input
              id="pf-first-name"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-last-name">Last name</Label>
            <Input
              id="pf-last-name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving}>
          {saving ? "Saving…" : "Save Profile"}
        </Button>
        {success && <span className="text-success text-xs">Saved!</span>}
      </div>
    </form>
  );
}

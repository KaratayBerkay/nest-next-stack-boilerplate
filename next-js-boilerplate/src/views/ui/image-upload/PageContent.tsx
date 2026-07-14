"use client";
import { useState, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
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

function ProfileFormTab() {
  const [avatar, setAvatar] = useState<UploadFile[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <form className="flex flex-col gap-4 max-w-sm" onSubmit={(e) => handleSave(e, setSaving, setSuccess)}>
      <p className="text-muted text-xs">
        A composed profile form: avatar upload, name fields, and save with loading state.
      </p>
      <div className="flex items-center gap-4">
        <ImageUpload avatar value={avatar} onChange={setAvatar} />
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-first-name">First name</Label>
            <Input id="pf-first-name" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-last-name">Last name</Label>
            <Input id="pf-last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving}>{saving ? "Saving…" : "Save Profile"}</Button>
        {success && <span className="text-xs text-success">Saved!</span>}
      </div>
    </form>
  );
}

function AvatarTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <p className="text-muted text-xs">
        Circular avatar upload. Hover to reveal the change overlay.
      </p>
      <ImageUpload
        avatar
        value={files}
        onChange={setFiles}
      />
    </div>
  );
}

function GalleryTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <p className="text-muted text-xs">
        Upload multiple images displayed in a grid with hover labels.
      </p>
      <ImageUpload
        multiple
        maxFiles={6}
        value={files}
        onChange={setFiles}
      />
    </div>
  );
}

function CoverPhotoTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <p className="text-muted text-xs">
        Single image upload with a video-aspect ratio (16:9) for cover photos.
      </p>
      <ImageUpload
        aspect="video"
        value={files}
        onChange={setFiles}
      />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "profile-form",
    title: "Profile Form",
    description: "Avatar upload composed with name fields and a save action — a real profile-editing block.",
    render: () => <ProfileFormTab />,
  },
  {
    id: "avatar",
    title: "Avatar",
    description: "Circular preview with a change overlay on hover. Replace-on-click for single image.",
    render: () => <AvatarTab />,
  },
  {
    id: "gallery",
    title: "Gallery Grid",
    description: "Multi-image upload displayed in a 2-column (3 on sm+) grid. Hover reveals file name and remove button.",
    render: () => <GalleryTab />,
  },
  {
    id: "cover",
    title: "Cover Photo",
    description: "Single image with a 16:9 aspect ratio, suitable for banners or cover photos.",
    render: () => <CoverPhotoTab />,
  },
];

export default function ImageUploadPage() {
  return (
    <ExampleTabs
      title="Image Upload"
      intro="An image-focused uploader built on FileUpload with thumbnail previews, multiple layout modes, and avatar support."
      examples={examples}
    />
  );
}

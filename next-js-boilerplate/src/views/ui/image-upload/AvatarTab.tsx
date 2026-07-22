"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { UploadFile } from "@/types/ui/FileUpload-types";

export function AvatarTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <p className="text-muted text-xs">
        Circular avatar upload. Hover to reveal the change overlay.
      </p>
      <ImageUpload avatar value={files} onChange={setFiles} />
    </div>
  );
}

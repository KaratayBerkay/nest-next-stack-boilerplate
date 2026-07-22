"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { UploadFile } from "@/types/ui/FileUpload-types";

export function GalleryTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <p className="text-muted text-xs">
        Upload multiple images displayed in a grid with hover labels.
      </p>
      <ImageUpload multiple maxFiles={6} value={files} onChange={setFiles} />
    </div>
  );
}

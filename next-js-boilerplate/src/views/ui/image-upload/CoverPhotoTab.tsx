"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { UploadFile } from "@/types/ui/FileUpload-types";

export function CoverPhotoTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex max-w-md flex-col gap-4">
      <p className="text-muted text-xs">
        Single image upload with a video-aspect ratio (16:9) for cover photos.
      </p>
      <ImageUpload aspect="video" value={files} onChange={setFiles} />
    </div>
  );
}

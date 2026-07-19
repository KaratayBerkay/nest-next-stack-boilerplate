"use client";

import { useState, useCallback } from "react";
import { useUploadActions } from "@/api/client/upload/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import type { UploadFile } from "@/types/ui/FileUpload-types";

const GALLERY_LABELS = {
  dropzoneIdle: "Drop images here or click to browse",
  dropzoneActive: "Drop images here",
  uploaded: "Uploaded",
  uploadFailed: "Upload failed",
  uploading: "Uploading...",
  uploadButton: (count: number) => `Upload ${count} image(s)`,
  remove: (file: string) => `Remove ${file}`,
};

export default function UploadsPage() {
  const { uploadWithProgress } = useUploadActions();
  const [avatarFiles, setAvatarFiles] = useState<UploadFile[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<UploadFile[]>([]);
  const [docFiles, setDocFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGalleryUpload = useCallback(
    async (file: File, reportProgress: (pct: number) => void) => {
      await uploadWithProgress(file, reportProgress);
    },
    [uploadWithProgress],
  );

  const handleDocSimulate = useCallback(
    async (_file: File, _reportProgress: (pct: number) => void) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setError("Document uploads are simulated — the backend only accepts images");
    },
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">File Uploads & Attachments</h2>
        <p className="text-muted text-xs">Real avatar/gallery uploads with progress bars</p>
      </div>

      <section className="surface flex flex-col gap-3 rounded-lg border border-border p-4">
        <h3 className="text-xs font-medium">Avatar</h3>
        <p className="text-xxs text-muted">Single image, 5 MB max, auto-uploaded</p>
        <ImageUpload
          avatar
          value={avatarFiles}
          onChange={setAvatarFiles}
          maxSizeBytes={5 * 1024 * 1024}
        />
      </section>

      <section className="surface flex flex-col gap-3 rounded-lg border border-border p-4">
        <h3 className="text-xs font-medium">Gallery</h3>
        <p className="text-xxs text-muted">Up to 6 images, parallel XHR uploads with real progress</p>
        <FileUpload
          multiple
          accept="image/*"
          maxFiles={6}
          maxSizeBytes={5 * 1024 * 1024}
          files={galleryFiles}
          onFilesChange={setGalleryFiles}
          onUpload={handleGalleryUpload}
          labels={GALLERY_LABELS}
        />
      </section>

      <section className="surface flex flex-col gap-3 rounded-lg border border-border p-4">
        <h3 className="text-xs font-medium">Documents</h3>
        <p className="text-xxs text-muted">
          Simulated — the backend only accepts images (JPEG, PNG, WebP, GIF, AVIF).
          This section shows where a real generic-file route would go.
        </p>
        <FileUpload
          multiple
          accept=".pdf,.docx"
          maxFiles={3}
          maxSizeBytes={5 * 1024 * 1024}
          files={docFiles}
          onFilesChange={setDocFiles}
          onUpload={handleDocSimulate}
          labels={{
            dropzoneIdle: "Drag PDF/DOCX here",
            dropzoneActive: "Drop files here",
            invalidType: (file, accepted) => `Only ${accepted} files are allowed — got ${file}`,
          }}
        />
      </section>

      {error && <FormErrorBanner message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}

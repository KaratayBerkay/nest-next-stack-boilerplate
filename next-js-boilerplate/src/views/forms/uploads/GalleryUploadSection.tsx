"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FileUpload } from "@/components/ui/FileUpload";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

interface GalleryUploadSectionProps {
  files: UploadFile[];
  onFilesChange: (files: UploadFile[]) => void;
  onUpload: (file: File, reportProgress: (pct: number) => void) => Promise<void>;
}

export function GalleryUploadSection({
  files,
  onFilesChange,
  onUpload,
}: GalleryUploadSectionProps) {
  const t = useMessages("forms");

  const labels = {
    dropzoneIdle: t.uploads.labels.dropzoneIdle,
    dropzoneActive: t.uploads.labels.dropzoneActive,
    uploaded: t.uploads.labels.uploaded,
    uploadFailed: t.uploads.labels.uploadFailed,
    uploading: t.uploads.labels.uploading,
    uploadButton: (count: number) => `Upload ${count} image(s)`,
    remove: (file: string) => t.uploads.labels.remove.replace("{file}", file),
    invalidTypeTitle: t.uploads.invalidFileType,
    maxSizeLabel: (max: string) =>
      t.uploads.labels.maxSize.replace("{max}", max),
  };

  return (
    <section className="surface border-border flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-xs font-medium">{t.uploads.gallery}</h3>
      <p className="text-xxs text-muted">{t.uploads.galleryDescription}</p>
      <FileUpload
        multiple
        accept="image/*"
        maxFiles={6}
        maxSizeBytes={MAX_UPLOAD_SIZE}
        files={files}
        onFilesChange={onFilesChange}
        onUpload={onUpload}
        labels={labels}
      />
    </section>
  );
}

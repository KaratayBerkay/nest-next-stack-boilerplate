"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FileUpload } from "@/components/ui/FileUpload";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

interface DocumentUploadSectionProps {
  files: UploadFile[];
  onFilesChange: (files: UploadFile[]) => void;
  onUpload: (file: File, reportProgress: (pct: number) => void) => Promise<void>;
}

export function DocumentUploadSection({
  files,
  onFilesChange,
  onUpload,
}: DocumentUploadSectionProps) {
  const t = useMessages("forms");

  const labels = {
    dropzoneIdle: t.uploads.labels.docDropzoneIdle,
    dropzoneActive: t.uploads.labels.docDropzoneActive,
    invalidType: (file: string, accepted: string) =>
      t.uploads.labels.invalidType
        .replace("{accepted}", accepted)
        .replace("{file}", file),
    invalidTypeTitle: t.uploads.invalidFileType,
    acceptedTypesText: () => t.uploads.labels.acceptedPdfWord,
    maxSizeLabel: (max: string) =>
      t.uploads.labels.maxSize.replace("{max}", max),
  };

  return (
    <section className="surface border-border flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-xs font-medium">{t.uploads.documents}</h3>
      <p className="text-xxs text-muted">{t.uploads.documentsDescription}</p>
      <FileUpload
        multiple
        accept=".pdf,.docx"
        maxFiles={3}
        maxSizeBytes={MAX_UPLOAD_SIZE}
        files={files}
        onFilesChange={onFilesChange}
        onUpload={onUpload}
        labels={labels}
      />
    </section>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useUploadActions } from "@/api/client/upload/actions";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { AvatarUploadSection } from "./AvatarUploadSection";
import { GalleryUploadSection } from "./GalleryUploadSection";
import { DocumentUploadSection } from "./DocumentUploadSection";

export default function UploadsPage() {
  const t = useMessages("forms");
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
      setError(
        "Document uploads are simulated — the backend only accepts images",
      );
    },
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.uploads.heading}</h2>
        <p className="text-muted text-xs">{t.examples.uploadsDescription}</p>
      </div>

      <AvatarUploadSection
        files={avatarFiles}
        onChange={setAvatarFiles}
      />

      <GalleryUploadSection
        files={galleryFiles}
        onFilesChange={setGalleryFiles}
        onUpload={handleGalleryUpload}
      />

      <DocumentUploadSection
        files={docFiles}
        onFilesChange={setDocFiles}
        onUpload={handleDocSimulate}
      />

      {error && (
        <FormErrorBanner message={error} onDismiss={() => setError(null)} />
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useUploadActions } from "@/api/client/upload/actions";
import { useProfileActions } from "@/api/client/profile/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

export default function UploadsPage() {
  const t = useMessages("forms");
  const { uploadWithProgress } = useUploadActions();
  const { uploadAvatar } = useProfileActions();
  const [avatarFiles, setAvatarFiles] = useState<UploadFile[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<UploadFile[]>([]);
  const [docFiles, setDocFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const galleryLabels = {
    dropzoneIdle: t.uploads.labels.dropzoneIdle,
    dropzoneActive: t.uploads.labels.dropzoneActive,
    uploaded: t.uploads.labels.uploaded,
    uploadFailed: t.uploads.labels.uploadFailed,
    uploading: t.uploads.labels.uploading,
    uploadButton: (count: number) => `Upload ${count} image(s)`,
    remove: (file: string) => t.uploads.labels.remove.replace("{file}", file),
  };

  const docLabels = {
    dropzoneIdle: t.uploads.labels.docDropzoneIdle,
    dropzoneActive: t.uploads.labels.docDropzoneActive,
    invalidType: (file: string, accepted: string) =>
      t.uploads.labels.invalidType
        .replace("{accepted}", accepted)
        .replace("{file}", file),
  };

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

      <section className="surface border-border flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-xs font-medium">{t.uploads.avatar}</h3>
        <p className="text-xxs text-muted">{t.uploads.avatarDescription}</p>
        <ImageUpload
          avatar
          value={avatarFiles}
          onChange={(files) => {
            const newFile = files.find(
              (f) =>
                f.status === "pending" &&
                !avatarFiles.some((af) => af.id === f.id),
            );
            if (newFile) {
              uploadAvatar(newFile.file)
                .then((result) => {
                  setAvatarFiles((prev) =>
                    prev.map((f) =>
                      f.id === newFile.id
                        ? {
                            ...f,
                            status: "done",
                            progress: 100,
                            preview: result.urls?.full,
                          }
                        : f,
                    ),
                  );
                })
                .catch(() => {
                  setAvatarFiles((prev) =>
                    prev.map((f) =>
                      f.id === newFile.id ? { ...f, status: "error" } : f,
                    ),
                  );
                });
            }
            setAvatarFiles(files);
          }}
          maxSizeBytes={MAX_UPLOAD_SIZE}
        />
      </section>

      <section className="surface border-border flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-xs font-medium">{t.uploads.gallery}</h3>
        <p className="text-xxs text-muted">{t.uploads.galleryDescription}</p>
        <FileUpload
          multiple
          accept="image/*"
          maxFiles={6}
          maxSizeBytes={MAX_UPLOAD_SIZE}
          files={galleryFiles}
          onFilesChange={setGalleryFiles}
          onUpload={handleGalleryUpload}
          labels={galleryLabels}
        />
      </section>

      <section className="surface border-border flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-xs font-medium">{t.uploads.documents}</h3>
        <p className="text-xxs text-muted">{t.uploads.documentsDescription}</p>
        <FileUpload
          multiple
          accept=".pdf,.docx"
          maxFiles={3}
          maxSizeBytes={MAX_UPLOAD_SIZE}
          files={docFiles}
          onFilesChange={setDocFiles}
          onUpload={handleDocSimulate}
          labels={docLabels}
        />
      </section>

      {error && (
        <FormErrorBanner message={error} onDismiss={() => setError(null)} />
      )}
    </div>
  );
}

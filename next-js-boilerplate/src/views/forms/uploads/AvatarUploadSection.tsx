"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useProfileActions } from "@/api/client/profile/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

interface AvatarUploadSectionProps {
  files: UploadFile[];
  onChange: (files: UploadFile[]) => void;
}

export function AvatarUploadSection({
  files,
  onChange,
}: AvatarUploadSectionProps) {
  const t = useMessages("forms");
  const { uploadAvatar } = useProfileActions();

  return (
    <section className="surface border-border flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-xs font-medium">{t.uploads.avatar}</h3>
      <p className="text-xxs text-muted">{t.uploads.avatarDescription}</p>
      <ImageUpload
        avatar
        value={files}
        onChange={(nextFiles) => {
          const newFile = nextFiles.find(
            (f) =>
              f.status === "pending" &&
              !files.some((af) => af.id === f.id),
          );
          if (newFile) {
            uploadAvatar(newFile.file)
              .then((result) => {
                onChange(
                  nextFiles.map((f) =>
                    f.id === newFile.id
                      ? { ...f, status: "done", progress: 100, preview: result.urls?.full }
                      : f,
                  ),
                );
              })
              .catch(() => {
                onChange(
                  nextFiles.map((f) =>
                    f.id === newFile.id ? { ...f, status: "error" } : f,
                  ),
                );
              });
          } else {
            onChange(nextFiles);
          }
        }}
        maxSizeBytes={MAX_UPLOAD_SIZE}
        labels={{
          invalidTypeTitle: t.uploads.invalidFileType,
          acceptedTypesText: () => t.uploads.labels.acceptedImages,
          maxSizeLabel: (max: string) =>
            t.uploads.labels.maxSize.replace("{max}", max),
        }}
      />
    </section>
  );
}

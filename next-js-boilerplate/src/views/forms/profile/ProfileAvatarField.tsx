/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MAX_UPLOAD_SIZE } from "@/constants/upload";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Label } from "@/components/ui/Label";
import { useProfileActions } from "@/api/client/profile/actions";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import type { ProfileFieldsProps } from "./ProfileFields-types";

export function ProfileAvatarField({
  form,
  t,
}: {
  form: ProfileFieldsProps["form"];
  t: ProfileFieldsProps["t"];
}) {
  const profile = t.profile as Record<string, string>;
  const { uploadAvatar } = useProfileActions();

  return (
    <form.AppField name="avatar">
      {(field: any) => {
        const files: UploadFile[] = field.state.value ?? [];
        return (
          <div className="flex flex-col gap-1">
            {profile.avatar && <Label>{profile.avatar}</Label>}
            <ImageUpload
              value={files}
              avatar
              maxSizeBytes={MAX_UPLOAD_SIZE}
              onChange={(nextFiles: UploadFile[]) => {
                // Same upload-on-select contract as AvatarUploadSection:
                // ImageUpload only ever hands back a local blob: preview
                // with status "pending" — the actual upload (and swapping
                // in the server URL) happens here. Previously this field
                // used the generic UploadField wrapper, which has no upload
                // logic of its own and just stored the field value
                // verbatim — submitProfile then read that ephemeral blob:
                // URL straight into avatarUrl, so "saving" silently
                // persisted a URL that's broken for everyone else and is
                // revoked the moment this component unmounts.
                const newFile = nextFiles.find(
                  (f) =>
                    f.status === "pending" &&
                    !files.some((existing) => existing.id === f.id),
                );
                if (!newFile) {
                  field.handleChange(nextFiles);
                  return;
                }
                field.handleChange(
                  nextFiles.map((f) =>
                    f.id === newFile.id ? { ...f, status: "uploading" } : f,
                  ),
                );
                uploadAvatar(newFile.file)
                  .then((result) => {
                    field.handleChange(
                      nextFiles.map((f) =>
                        f.id === newFile.id
                          ? {
                              ...f,
                              status: "done",
                              progress: 100,
                              preview: result.urls?.full ?? f.preview,
                            }
                          : f,
                      ),
                    );
                  })
                  .catch(() => {
                    field.handleChange(
                      nextFiles.map((f) =>
                        f.id === newFile.id ? { ...f, status: "error" } : f,
                      ),
                    );
                  });
              }}
            />
          </div>
        );
      }}
    </form.AppField>
  );
}

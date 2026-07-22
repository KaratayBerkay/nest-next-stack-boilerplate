/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MAX_UPLOAD_SIZE } from "@/constants/upload";

export function ProfileAvatarField({ form }: { form: any }) {
  return (
    <form.AppField name="avatar">
      {(field: any) => (
        <field.UploadField
          label="Avatar"
          avatar
          maxSizeBytes={MAX_UPLOAD_SIZE}
        />
      )}
    </form.AppField>
  );
}

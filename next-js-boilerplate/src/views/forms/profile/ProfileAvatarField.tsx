/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MAX_UPLOAD_SIZE } from "@/constants/upload";
import type { ProfileFieldsProps } from "./ProfileFields-types";

export function ProfileAvatarField({
  form,
  t,
}: {
  form: ProfileFieldsProps["form"];
  t: ProfileFieldsProps["t"];
}) {
  const profile = t.profile as Record<string, string>;

  return (
    <form.AppField name="avatar">
      {(field: any) => (
        <field.UploadField
          label={profile.avatar}
          avatar
          maxSizeBytes={MAX_UPLOAD_SIZE}
        />
      )}
    </form.AppField>
  );
}

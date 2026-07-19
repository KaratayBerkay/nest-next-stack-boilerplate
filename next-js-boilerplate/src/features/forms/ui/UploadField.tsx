"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { FileUpload } from "@/components/ui/FileUpload";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { UploadFieldProps } from "@/types/forms/UploadField-types";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

export function UploadField({ label, required, avatar, maxSizeBytes, maxFiles, accept, labels }: UploadFieldProps) {
  const field = useFieldContext<UploadFile[]>();
  const files = field.state.value ?? [];

  return (
    <div className="flex flex-col gap-1">
      {label && <Label required={required}>{label}</Label>}
      {avatar ? (
        <ImageUpload
          value={files}
          onChange={(val) => field.handleChange(val)}
          avatar
          maxSizeBytes={maxSizeBytes ?? MAX_UPLOAD_SIZE}
          labels={labels}
        />
      ) : (
        <FileUpload
          multiple
          accept={accept}
          maxSizeBytes={maxSizeBytes}
          maxFiles={maxFiles}
          files={files}
          onFilesChange={(val) => field.handleChange(val)}
          labels={labels}
        />
      )}
      <FormFieldInfo field={field} />
    </div>
  );
}

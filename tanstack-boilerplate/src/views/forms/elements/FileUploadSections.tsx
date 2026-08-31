import { useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FileUpload } from "@/components/ui/FileUpload";
import { FileInput } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import { SectionCard } from "./SectionCard";

export function FileInputSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_fileInput}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Label>{t.elements.fileInput_label}</Label>
          <FieldInfoButton description={t.elements.fileInput_info} />
        </div>
        <FileInput buttonLabel={t.elements.fileInput_buttonLabel} />
      </div>
    </SectionCard>
  );
}

export function DropzoneSection() {
  const t = useMessages("forms");
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <SectionCard label={t.elements.section_dropzone}>
      <FileUpload
        accept="image/*,.pdf"
        maxSizeBytes={5 * 1024 * 1024}
        files={files}
        onFilesChange={setFiles}
        labels={{
          dropzoneIdle: t.elements.dropzone_text,
          acceptedLabel: t.elements.dropzone_formats,
        }}
      />
    </SectionCard>
  );
}

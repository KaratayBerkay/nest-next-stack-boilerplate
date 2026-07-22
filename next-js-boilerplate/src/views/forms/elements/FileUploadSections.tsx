import { useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FileUpload } from "@/components/ui/FileUpload";
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
        <label className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {t.elements.fileInput_buttonLabel}
          <input type="file" className="sr-only" />
        </label>
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

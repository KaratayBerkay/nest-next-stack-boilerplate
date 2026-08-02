import type { UploadFile } from "@/types/ui/FileUpload-types";

export interface GalleryUploadSectionProps {
  files: UploadFile[];
  onFilesChange: (files: UploadFile[]) => void;
  onUpload: (
    file: File,
    reportProgress: (pct: number) => void,
  ) => Promise<void>;
}

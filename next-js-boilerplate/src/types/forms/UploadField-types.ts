import type { FileUploadLabels } from "@/types/ui/FileUpload-types";

export interface UploadFieldProps {
  label?: string;
  required?: boolean;
  avatar?: boolean;
  maxSizeBytes?: number;
  maxFiles?: number;
  accept?: string;
  labels?: FileUploadLabels;
}

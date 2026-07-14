import type { UploadFile } from "./FileUpload-types";

export interface ImageUploadProps {
  value: UploadFile[];
  onChange: (files: UploadFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  avatar?: boolean;
  aspect?: "square" | "video";
  className?: string;
}

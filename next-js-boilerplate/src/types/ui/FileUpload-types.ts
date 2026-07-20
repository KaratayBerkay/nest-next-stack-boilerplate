export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  preview?: string;
}

export type FileUploadLabels = {
  dropzoneIdle?: string;
  dropzoneActive?: string;
  acceptedLabel?: string;
  invalidType?: (file: string, accepted: string) => string;
  tooLarge?: (file: string, max: string) => string;
  uploaded?: string;
  uploadFailed?: string;
  remove?: (file: string) => string;
  uploadButton?: (count: number) => string;
  uploading?: string;
  changePhoto?: string;
  removePhoto?: string;
  acceptedTypesText?: (accept: string) => string;
  maxSizeLabel?: (max: string) => string;
  invalidTypeTitle?: string;
};

export interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxSizeBytes?: number;
  maxFiles?: number;
  files: UploadFile[];
  onFilesChange: (files: UploadFile[]) => void;
  onUpload?: (
    file: File,
    reportProgress: (pct: number) => void,
  ) => Promise<void>;
  className?: string;
  disabled?: boolean;
  labels?: FileUploadLabels;
}

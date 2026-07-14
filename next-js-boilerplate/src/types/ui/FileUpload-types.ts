export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  preview?: string;
}

export interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxSizeBytes?: number;
  maxFiles?: number;
  files: UploadFile[];
  onFilesChange: (files: UploadFile[]) => void;
  onUpload?: (file: File, reportProgress: (pct: number) => void) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

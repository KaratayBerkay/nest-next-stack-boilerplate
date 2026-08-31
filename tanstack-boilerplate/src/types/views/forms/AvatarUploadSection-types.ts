import type { UploadFile } from "@/types/ui/FileUpload-types";

export interface AvatarUploadSectionProps {
  files: UploadFile[];
  onChange: (files: UploadFile[]) => void;
}

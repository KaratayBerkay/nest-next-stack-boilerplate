import { xhrUpload } from "@/lib/xhr-upload";
import { UPLOAD_URL } from "@/constants/api/urls";
import type { XhrUploadResult } from "@/lib/xhr-upload";

export function uploadSingleWithProgress(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<XhrUploadResult> {
  return xhrUpload(UPLOAD_URL, file, "file", onProgress);
}

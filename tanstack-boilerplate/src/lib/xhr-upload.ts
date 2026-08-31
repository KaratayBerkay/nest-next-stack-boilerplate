import type { ExceptionResponse } from "@/lib/api-client";
import { POST } from "@/constants/api/methods";

export interface XhrUploadResult {
  urls?: { badge: string; medium: string; full: string };
  originalname?: string;
  mimetype?: string;
  size?: number;
}

export function xhrUpload(
  url: string,
  file: File,
  fieldName: string,
  onProgress?: (pct: number) => void,
): Promise<XhrUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(POST, url);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        if (xhr.status === 401 && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
        let body: Partial<ExceptionResponse> | undefined;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          /* ignore parse errors */
        }
        const err = new Error(
          body?.msg ?? `Upload failed: ${xhr.status}`,
        ) as Error & { exception?: ExceptionResponse };
        if (body?.exc && body?.msg) {
          err.exception = body as ExceptionResponse;
        }
        reject(err);
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    const formData = new FormData();
    formData.append(fieldName, file);
    xhr.send(formData);
  });
}

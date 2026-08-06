import { apiFetchJson, refreshSession } from "@/lib/api-client";
import {
  UPLOAD_ATTACHMENT_STREAM_URL,
  UPLOAD_ATTACHMENT_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import {
  OCTET_STREAM_CONTENT_TYPE_HEADER,
  STREAM_CONTENT_TYPE_HEADER,
  STREAM_FILENAME_HEADER,
} from "@/constants/api/headers";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export interface UploadAttachmentResult {
  url: string;
  originalname: string;
  mimetype: string;
  size: number;
  envelope?: { v: string; nonce: string; ct: string };
}

export async function uploadAttachmentServer(
  file: File,
): Promise<UploadAttachmentResult> {
  const form = new FormData();
  form.append("file", file);
  return apiFetchJson<UploadAttachmentResult>(UPLOAD_ATTACHMENT_URL, {
    method: POST,
    body: form,
  });
}

/**
 * Streamed attachment upload with byte-level progress.
 *
 * `fetch` exposes no upload progress, so the raw octet-stream body rides an
 * XMLHttpRequest instead — `xhr.upload.onprogress` reports real `loaded`/
 * `total` while the browser streams the file to the backend's
 * `/api/upload/attachment-stream` endpoint (which reads the in-flight body
 * in chunks, no multer buffering). Mirrors apiFetch's one-shot 401
 * refresh-and-retry for session rotation.
 */
export async function uploadAttachmentStreamServer(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<UploadAttachmentResult> {
  let lastStatus = 0;

  const run = (): Promise<UploadAttachmentResult> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(POST, UPLOAD_ATTACHMENT_STREAM_URL, true);
      xhr.setRequestHeader(
        "Content-Type",
        OCTET_STREAM_CONTENT_TYPE_HEADER["Content-Type"],
      );
      xhr.setRequestHeader(
        STREAM_FILENAME_HEADER,
        encodeURIComponent(file.name),
      );
      xhr.setRequestHeader(
        STREAM_CONTENT_TYPE_HEADER,
        file.type || OCTET_STREAM_CONTENT_TYPE_HEADER["Content-Type"],
      );
      xhr.responseType = "json";

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress?.(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        lastStatus = xhr.status;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as UploadAttachmentResult);
          return;
        }
        const body = xhr.response as { msg?: string } | null;
        reject(new Error(body?.msg ?? `Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Upload network error"));
      xhr.onabort = () =>
        reject(new DOMException("Upload aborted", "AbortError"));

      if (signal) {
        const onAbort = () => xhr.abort();
        if (signal.aborted) xhr.abort();
        else signal.addEventListener("abort", onAbort, { once: true });
      }

      xhr.send(file);
    });

  try {
    return await run();
  } catch (err) {
    if (lastStatus !== 401 || typeof window === "undefined") throw err;
    const refreshed = await refreshSession();
    if (!refreshed) throw err;
    return run();
  }
}

export function toMessageAttachment(
  result: UploadAttachmentResult,
): MessageAttachment {
  return {
    url: result.url,
    type: result.mimetype,
    name: result.originalname,
    // The at-rest envelope is intentionally NOT carried: it is generated and
    // persisted server-side at upload time (PendingUpload) and resolved at
    // message-save time. Shipping the full-file ciphertext in a WS frame
    // exceeds the socket's 64 KiB maxPayload and kills the server.
  };
}

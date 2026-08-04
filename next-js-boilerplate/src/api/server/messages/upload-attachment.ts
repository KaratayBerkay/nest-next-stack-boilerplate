import { apiFetchJson } from "@/lib/api-client";
import { UPLOAD_ATTACHMENT_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
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

export function toMessageAttachment(
  result: UploadAttachmentResult,
): MessageAttachment {
  return {
    url: result.url,
    type: result.mimetype,
    name: result.originalname,
    storageEnvelope: result.envelope ?? null,
  };
}

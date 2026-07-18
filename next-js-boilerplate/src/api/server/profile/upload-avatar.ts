import { apiFetchJson } from "@/lib/api-client";
import { UPLOAD_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export interface UploadAvatarResult {
  urls: { full: string };
}

export async function uploadAvatarServer(file: File): Promise<UploadAvatarResult> {
  const form = new FormData();
  form.append("file", file);
  return apiFetchJson<UploadAvatarResult>(UPLOAD_URL, { method: POST, body: form });
}

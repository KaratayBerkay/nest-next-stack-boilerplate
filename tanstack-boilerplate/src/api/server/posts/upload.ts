import { apiFetch } from "@/lib/api-client";
import { UPLOAD_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function uploadImageServer(
  file: File,
): Promise<string | undefined> {
  const formData = new FormData();
  formData.set("file", file);
  const res = await apiFetch(UPLOAD_URL, {
    method: POST,
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.urls?.full;
}

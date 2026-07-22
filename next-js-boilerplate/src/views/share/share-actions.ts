"use client";

import { type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";

export function handleFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setFile: Dispatch<SetStateAction<File | null>>,
  setUploadError: Dispatch<SetStateAction<boolean>>,
  setPreview: Dispatch<SetStateAction<string | null>>,
) {
  const f = e.target.files?.[0];
  if (!f) return;
  setFile(f);
  setUploadError(false);
  const reader = new FileReader();
  reader.onloadend = () => setPreview(reader.result as string);
  reader.readAsDataURL(f);
}

export async function handleShareSubmit(
  e: React.SyntheticEvent,
  title: string,
  content: string,
  submitting: boolean,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setUploading: Dispatch<SetStateAction<boolean>>,
  setUploadError: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  file: File | null,
  uploadError: boolean,
  coverImageRef: React.MutableRefObject<string | undefined>,
  router: ReturnType<typeof useRouter>,
  lang: string,
  failedToCreatePost: string,
  createPost: (
    title: string,
    content: string,
    imageUrl?: string,
  ) => Promise<void>,
) {
  e.preventDefault();
  if (!title.trim() || !content.trim() || submitting) return;

  setSubmitting(true);
  setError(null);

  try {
    if (file && !uploadError) {
      setUploading(true);
      try {
        const { uploadImageServer } = await import("@/api/server/posts/upload");
        const url = await uploadImageServer(file);
        if (url) {
          coverImageRef.current = url;
        } else {
          setUploadError(true);
          setSubmitting(false);
          setUploading(false);
          return;
        }
      } catch {
        setUploadError(true);
        setSubmitting(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    await createPost(title.trim(), content.trim(), coverImageRef.current);
    router.push(`/v1/${lang}/feed`);
  } catch {
    setError(failedToCreatePost);
  } finally {
    setSubmitting(false);
    setUploading(false);
  }
}

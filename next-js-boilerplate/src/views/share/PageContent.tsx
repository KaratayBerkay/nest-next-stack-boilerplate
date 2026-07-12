"use client";

import { apiFetch } from "@/lib/api-client";
import { useState, useRef, type Dispatch, type SetStateAction } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { UPLOAD_URL, POSTS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import { PageInfoButton } from "@/components/ui/page-info";
import { sharePageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";

function handleFileChange(
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

async function handleShareSubmit(
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
) {
  e.preventDefault();
  if (!title.trim() || !content.trim() || submitting) return;

  setSubmitting(true);
  setError(null);

  try {
    if (file && !uploadError) {
      setUploading(true);
      const formData = new FormData();
      formData.set("file", file);
      const uploadRes = await apiFetch(UPLOAD_URL, {
        method: POST,
        body: formData,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        coverImageRef.current = uploadData.urls?.full;
      } else {
        setUploadError(true);
        setSubmitting(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const res = await apiFetch(POSTS_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        ...(coverImageRef.current ? { imageUrl: coverImageRef.current } : {}),
      }),
    });

    if (res.ok) {
      router.push(`/v1/${lang}/feed`);
    } else {
      const data = await res.json();
      setError(data.error || failedToCreatePost);
    }
  } catch {
    setError(failedToCreatePost);
  } finally {
    setSubmitting(false);
    setUploading(false);
  }
}

export default function PageContent() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const t = useMessages("share");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const coverImageRef = useRef<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const isDisabled =
    !title.trim() || !content.trim() || submitting || uploadError;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">{t.shareSomething}</h2>
        <PageInfoButton content={sharePageInfo} />
      </div>

      <form
        onSubmit={(e) =>
          handleShareSubmit(
            e,
            title,
            content,
            submitting,
            setSubmitting,
            setUploading,
            setUploadError,
            setError,
            file,
            uploadError,
            coverImageRef,
            router,
            lang,
            t.failedToCreatePost,
          )
        }
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="title">{t.title}</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={200}
            placeholder={t.titlePlaceholder}
            disabled={submitting}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="content">{t.content}</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder={t.contentPlaceholder}
            disabled={submitting}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>{t.imageOptional}</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileChange(e, setFile, setUploadError, setPreview)
            }
            disabled={submitting}
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-0.5 file:text-xs disabled:opacity-50"
          />
          {preview && (
            <div className="relative mt-2">
              <img
                src={preview}
                alt={t.preview}
                className={`max-h-48 rounded-lg object-cover ${uploading ? "opacity-50" : ""}`}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30">
                  <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
                    <svg
                      className="h-3 w-3 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t.uploading}
                  </div>
                </div>
              )}
              {!uploading && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setUploadError(false);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              {uploadError && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  <span>{t.imageUploadFailed}</span>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setUploadError(false);
                      coverImageRef.current = undefined;
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    {t.remove}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={async () => {
                      setUploadError(false);
                      coverImageRef.current = undefined;
                    }}
                  >
                    {t.retry}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500" data-testid="share-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isDisabled}
          className="self-start"
        >
          {uploading ? t.uploading : submitting ? t.sharing : t.share}
        </Button>
      </form>
    </div>
  );
}

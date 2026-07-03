"use client";

import { apiFetch } from "@/lib/api-client";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SharePage() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const coverImageRef = useRef<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadError(false);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      if (file && !uploadError) {
        const formData = new FormData();
        formData.set("file", file);
        const uploadRes = await apiFetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          coverImageRef.current = uploadData.urls?.full;
        } else {
          setUploadError(true);
          setSubmitting(false);
          return;
        }
      }

      const res = await apiFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setError(data.error || "Failed to create post");
      }
    } catch {
      setError("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">Share something</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-muted text-xs font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={200}
            placeholder="What's on your mind?"
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="content" className="text-muted text-xs font-medium">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder="Write something..."
            className="border-border bg-surface min-h-[120px] rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-muted text-xs font-medium">
            Image (optional)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-0.5 file:text-xs"
          />
          {preview && (
            <div className="relative mt-2">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
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
              {uploadError && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  <span>Image couldn&apos;t be uploaded.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setUploadError(false);
                      coverImageRef.current = undefined;
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="ml-auto rounded px-2 py-0.5 font-medium underline hover:no-underline"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setUploadError(false);
                      coverImageRef.current = undefined;
                    }}
                    className="rounded px-2 py-0.5 font-medium underline hover:no-underline"
                  >
                    Retry
                  </button>
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

        <button
          type="submit"
          disabled={
            !title.trim() || !content.trim() || submitting || uploadError
          }
          className="bg-brand self-start rounded-lg px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {submitting ? "Sharing..." : "Share"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PageInfoButton } from "@/components/ui/page-info";
import { sharePageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { usePostActions } from "@/api/client/posts/actions";
import { cn } from "@/lib/cn";
import { ImagePreviewSection } from "@/views/share/ImagePreviewSection";
import { handleFileChange, handleShareSubmit } from "@/views/share/share-actions";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

export default function PageContent({ className }: ClassNameProps) {
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
  const { createPost } = usePostActions();

  const isDisabled =
    !title.trim() || !content.trim() || submitting || uploadError;

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
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
            createPost,
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
            className="border-border bg-surface file:bg-surface rounded-lg border px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:px-2 file:py-0.5 file:text-xs disabled:opacity-50"
          />
          <ImagePreviewSection
            preview={preview}
            uploading={uploading}
            uploadError={uploadError}
            coverImageRef={coverImageRef}
            fileRef={fileRef}
            setFile={setFile}
            setPreview={setPreview}
            setUploadError={setUploadError}
            t={t}
          />
        </div>

        {error && (
          <p className="text-error text-sm" data-testid="share-error">
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

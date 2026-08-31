"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { PostEditFormProps } from "@/types/views/posts/PostEditForm-types";

export function PostEditForm({
  post: _post,
  editTitle,
  editContent,
  onEditTitleChange,
  onEditContentChange,
  onSave,
  onCancel,
}: PostEditFormProps) {
  const t = useMessages("posts");

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="text"
        value={editTitle}
        onChange={(e) => onEditTitleChange(e.target.value)}
        className="text-lg font-bold"
      />
      <Textarea
        value={editContent}
        onChange={(e) => onEditContentChange(e.target.value)}
        rows={5}
      />
      <div className="flex items-center gap-2">
        <Button onClick={onSave}>{t.save}</Button>
        <Button variant="link" onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </div>
  );
}

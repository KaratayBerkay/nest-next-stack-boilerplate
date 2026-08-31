import { Button } from "@/components/ui/Button";
import type { EditorHeaderProps } from "@/types/views/forms/EditorHeader-types";

export function EditorHeader({
  heading,
  editLabel,
  previewLabel,
  preview,
  onToggle,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-sm font-semibold">{heading}</h2>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={preview ? "secondary" : "default"}
          onClick={() => onToggle(false)}
        >
          {editLabel}
        </Button>
        <Button
          size="sm"
          variant={preview ? "default" : "secondary"}
          onClick={() => onToggle(true)}
        >
          {previewLabel}
        </Button>
      </div>
    </div>
  );
}

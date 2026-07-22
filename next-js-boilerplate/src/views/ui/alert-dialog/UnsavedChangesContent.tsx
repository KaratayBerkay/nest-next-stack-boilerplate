"use client";
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const INITIAL_CONTENT =
  "Draft: Project notes\n\n- Update dependencies\n- Review PR #42\n- Deploy to staging";

function handleSave(
  setOriginalText: Dispatch<SetStateAction<string>>,
  text: string,
  toast: ReturnType<typeof useToast>["toast"],
) {
  setOriginalText(text);
  toast({
    title: "Changes saved",
    description: "Your content has been saved.",
    variant: "success",
  });
}

function handleDiscard(
  setText: Dispatch<SetStateAction<string>>,
  originalText: string,
) {
  setText(originalText);
}

function handleCloseClick(
  isDirty: boolean,
  setDialogOpen: Dispatch<SetStateAction<boolean>>,
) {
  if (isDirty) setDialogOpen(true);
}

export function UnsavedChangesContent() {
  const [text, setText] = useState(INITIAL_CONTENT);
  const [originalText, setOriginalText] = useState(INITIAL_CONTENT);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const isDirty = text !== originalText;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {isDirty && (
            <span className="bg-warning inline-block h-2 w-2 rounded-full" />
          )}
          Editor
        </span>
        <span className="text-muted text-xs">
          {isDirty ? "Unsaved changes" : "All saved"}
        </span>
      </div>
      <textarea
        className="border-border bg-bg min-h-[120px] w-full rounded border p-3 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => handleCloseClick(isDirty, setDialogOpen)}
        >
          Close
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setText(INITIAL_CONTENT);
            setOriginalText(INITIAL_CONTENT);
          }}
        >
          Reset
        </Button>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error text-error-fg rounded px-4 py-2 text-sm"
              onClick={() => handleDiscard(setText, originalText)}
            >
              Discard
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-brand rounded px-4 py-2 text-sm text-brand-fg"
              onClick={() => handleSave(setOriginalText, text, toast)}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

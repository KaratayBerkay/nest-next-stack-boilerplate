import type { Draft } from "@/views/forms/content-editor/draft-utils";

export interface DraftAlertProps {
  draft: Draft;
  restoreLabel: string;
  discardLabel: string;
  discardConfirmLabel: string;
  onRestore: () => void;
  onDiscard: () => void;
}

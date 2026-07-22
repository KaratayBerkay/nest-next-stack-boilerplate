import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Draft } from "./draft-utils";

interface DraftAlertProps {
  draft: Draft;
  restoreLabel: string;
  discardLabel: string;
  discardConfirmLabel: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftAlert({
  draft,
  restoreLabel,
  discardLabel,
  discardConfirmLabel,
  onRestore,
  onDiscard,
}: DraftAlertProps) {
  return (
    <div className="surface border-border flex items-center justify-between rounded-lg border p-3">
      <span className="text-xs">
        {restoreLabel.replace(
          "{time}",
          new Date(draft.savedAt).toLocaleString(),
        )}
      </span>
      <div className="flex gap-2">
        <ConfirmDialog
          title={discardLabel}
          description={discardConfirmLabel}
          confirmLabel={discardLabel}
          onConfirm={onDiscard}
        >
          {(open) => (
            <Button size="sm" variant="outline" onClick={open}>
              {discardLabel}
            </Button>
          )}
        </ConfirmDialog>
        <Button size="sm" onClick={onRestore}>
          {restoreLabel}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import type { EditableTableRowActionsProps } from "@/types/forms/EditableTableRowActions-types";

export function EditableTableRowActions({
  field,
  index: i,
  status,
  onSaveRow,
  t,
}: EditableTableRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        className="text-muted hover:text-fg"
        onClick={() => {
          const r = field.state.value[i];
          field.insertValue(i + 1, {
            ...r,
            description: `${r.description} (copy)`,
          });
        }}
        title={t.editableTable.duplicateRow}
        aria-label={t.editableTable.duplicateRow}
      >
        ⧉
      </button>
      <button
        className="text-muted hover:text-fg"
        disabled={i === 0}
        onClick={() => field.moveValue(i, i - 1)}
        title={t.editableTable.moveUp}
        aria-label={t.editableTable.moveUp}
      >
        ↑
      </button>
      <button
        className="text-muted hover:text-fg"
        disabled={i >= field.state.value.length - 1}
        onClick={() => field.moveValue(i, i + 1)}
        title={t.editableTable.moveDown}
        aria-label={t.editableTable.moveDown}
      >
        ↓
      </button>
      <ConfirmDialog
        title={t.editableTable.removeRow}
        description={t.editableTable.removeRowConfirm}
        confirmLabel={t.editableTable.removeRow}
        onConfirm={() => field.removeValue(i)}
      >
        {(open) => (
          <button
            className="text-destructive"
            onClick={open}
            title={t.editableTable.removeRow}
            aria-label={t.editableTable.removeRow}
          >
            ×
          </button>
        )}
      </ConfirmDialog>
      <button
        className="text-muted hover:text-success"
        onClick={() => onSaveRow(i)}
        title={t.editableTable.saveRow}
        aria-label={t.editableTable.saveRow}
      >
        ✓
      </button>
      {status === "saved" && (
        <Badge variant="success" className="text-xxs">
          {t.editableTable.savedBadge}
        </Badge>
      )}
    </div>
  );
}

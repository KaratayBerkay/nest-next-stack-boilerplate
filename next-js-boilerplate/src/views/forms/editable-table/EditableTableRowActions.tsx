"use client";

import {
  IconCopy,
  IconArrowUp,
  IconArrowDown,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/button/icon-button";
import { Badge } from "@/components/ui/Badge";
import type { EditableTableRowActionsProps } from "@/types/forms/EditableTableRowActions-types";

export function EditableTableRowActions({
  field,
  index: i,
  rowKey,
  status,
  onSaveRow,
  onDuplicateRow,
  onMoveRow,
  onRemoveRow,
  t,
}: EditableTableRowActionsProps) {
  return (
    <div className="flex h-9 items-center gap-1">
      <IconButton
        icon={<IconCopy size={14} />}
        variant="ghost"
        size="icon-xs"
        onClick={() => onDuplicateRow(i)}
        label={t.editableTable.duplicateRow}
      />
      <IconButton
        icon={<IconArrowUp size={14} />}
        variant="ghost"
        size="icon-xs"
        disabled={i === 0}
        onClick={() => onMoveRow(i, i - 1)}
        label={t.editableTable.moveUp}
      />
      <IconButton
        icon={<IconArrowDown size={14} />}
        variant="ghost"
        size="icon-xs"
        disabled={i >= field.state.value.length - 1}
        onClick={() => onMoveRow(i, i + 1)}
        label={t.editableTable.moveDown}
      />
      <ConfirmDialog
        title={t.editableTable.removeRow}
        description={t.editableTable.removeRowConfirm}
        confirmLabel={t.editableTable.removeRow}
        onConfirm={() => onRemoveRow(i)}
      >
        {(open) => (
          <IconButton
            icon={<IconX size={14} />}
            variant="ghost"
            size="icon-xs"
            onClick={open}
            label={t.editableTable.removeRow}
          />
        )}
      </ConfirmDialog>
      <IconButton
        icon={<IconCheck size={14} />}
        variant="ghost"
        size="icon-xs"
        onClick={() => onSaveRow(rowKey)}
        label={t.editableTable.saveRow}
      />
      {status === "saved" && (
        <Badge variant="success" className="text-xxs">
          {t.editableTable.savedBadge}
        </Badge>
      )}
    </div>
  );
}

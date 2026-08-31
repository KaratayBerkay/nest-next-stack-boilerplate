/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RowStatus } from "@/views/forms/editable-table/EditableTable-constants";

export interface EditableTableRowActionsProps {
  field: any;
  index: number;
  rowKey: string;
  status: RowStatus;
  onSaveRow: (rowKey: string) => void;
  onDuplicateRow: (idx: number) => void;
  onMoveRow: (from: number, to: number) => void;
  onRemoveRow: (idx: number) => void;
  t: any;
}

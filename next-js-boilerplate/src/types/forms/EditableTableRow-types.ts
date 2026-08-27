/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RowStatus } from "@/views/forms/editable-table/EditableTable-constants";

export interface EditableTableRowProps {
  form: any;
  field: any;
  index: number;
  rowKey: string;
  status: RowStatus;
  rowSchemas: any;
  onSaveRow: (rowKey: string) => void;
  onDuplicateRow: (idx: number) => void;
  onMoveRow: (from: number, to: number) => void;
  onRemoveRow: (idx: number) => void;
  t: any;
  simulateError: any;
  toast: any;
  allMessages: any;
}

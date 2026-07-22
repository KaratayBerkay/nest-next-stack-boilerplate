/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RowStatus } from "@/views/forms/editable-table/EditableTable-constants";

export interface EditableTableRowActionsProps {
  field: any;
  index: number;
  status: RowStatus;
  onSaveRow: (idx: number) => void;
  t: any;
}

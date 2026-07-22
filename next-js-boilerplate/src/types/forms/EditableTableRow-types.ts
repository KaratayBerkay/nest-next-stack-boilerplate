/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RowStatus } from "@/views/forms/editable-table/EditableTable-constants";

export interface EditableTableRowProps {
  form: any;
  field: any;
  index: number;
  status: RowStatus;
  rowSchemas: any;
  onSaveRow: (idx: number) => void;
  t: any;
  simulateError: any;
  toast: any;
  allMessages: any;
}

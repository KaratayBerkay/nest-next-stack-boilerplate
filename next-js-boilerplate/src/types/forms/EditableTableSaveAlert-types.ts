export interface EditableTableSaveResult {
  id: number;
  variant: "success" | "error";
  title: string;
  description?: string;
}

export interface EditableTableSaveAlertProps {
  result: EditableTableSaveResult;
  onDone: () => void;
}

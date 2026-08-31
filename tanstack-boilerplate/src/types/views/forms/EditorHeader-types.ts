export interface EditorHeaderProps {
  heading: string;
  editLabel: string;
  previewLabel: string;
  preview: boolean;
  onToggle: (preview: boolean) => void;
}

export type PopupPhase = "closed" | "open" | "closing";

export interface PopupAlertProps {
  phase: PopupPhase;
  remainingMs: number;
  onDismiss: () => void;
}

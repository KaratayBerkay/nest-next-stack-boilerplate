import type { MouseEvent, RefObject } from "react";

export function handleKeyDownModuleLevel(e: KeyboardEvent, onDismiss: () => void) {
  if (e.key === "Escape") onDismiss();
}

export function handleCancelModuleLevel(e: Event, onDismiss: () => void) {
  e.preventDefault();
  onDismiss();
}

export function handleBackdropClickModuleLevel(
  e: MouseEvent<HTMLDialogElement>,
  dialogRef: RefObject<HTMLDialogElement | null>,
  onDismiss: () => void,
) {
  if (e.target === dialogRef.current) {
    onDismiss();
  }
}

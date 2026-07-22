import type { MutableRefObject } from "react";

export interface DragState {
  dragging: boolean;
  startX: number;
  currentX: number;
}

export function dragOnStart(
  clientX: number,
  dragStateRef: MutableRefObject<DragState>,
) {
  dragStateRef.current = { dragging: true, startX: clientX, currentX: clientX };
}

export function dragOnMove(
  clientX: number,
  dragStateRef: MutableRefObject<DragState>,
) {
  if (!dragStateRef.current.dragging) return;
  dragStateRef.current.currentX = clientX;
}

export function dragOnEnd(
  dragStateRef: MutableRefObject<DragState>,
  close: () => void,
  toggleRef: MutableRefObject<HTMLButtonElement | null>,
) {
  if (!dragStateRef.current.dragging) return;
  const dx = dragStateRef.current.currentX - dragStateRef.current.startX;
  dragStateRef.current.dragging = false;
  if (dx < -50) {
    close();
    toggleRef.current?.focus();
  }
}

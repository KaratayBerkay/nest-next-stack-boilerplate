export interface PopoverPositionInput {
  triggerRect: { top: number; bottom: number; left: number; right: number };
  contentWidth: number;
  contentHeight: number;
  align: "start" | "end";
  sideOffset: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface PopoverPosition {
  top: number;
  left: number;
}

export function calculatePopoverPosition(
  input: PopoverPositionInput,
): PopoverPosition {
  const {
    triggerRect,
    contentWidth,
    contentHeight,
    align,
    sideOffset,
    viewportWidth,
    viewportHeight,
  } = input;

  const left = Math.min(
    Math.max(8, align === "end" ? triggerRect.right - contentWidth : triggerRect.left),
    viewportWidth - contentWidth - 8,
  );

  const spaceBelow = viewportHeight - triggerRect.bottom;
  const top =
    contentHeight > spaceBelow && triggerRect.top > contentHeight
      ? triggerRect.top - contentHeight - sideOffset
      : triggerRect.bottom + sideOffset;

  return { top, left };
}

import type React from "react";

export interface PopoverProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: PopoverVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type PopoverVariant = "default";

export interface PopoverTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  asChild?: boolean;
}

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  align?: "start" | "end";
  sideOffset?: number;
  className?: string;
  variant?: PopoverVariant;
  initialFocus?: React.RefObject<HTMLElement>;
  title?: string;
  /** Always render as the mobile bottom sheet, regardless of viewport width. */
  forceBottomSheet?: boolean;
  /**
   * Match left position + width to this element instead of the trigger
   * (which stays the anchor for vertical placement). For panels like the
   * emoji picker that should span a whole chat pane rather than float at
   * the trigger's own (small icon-button) width.
   */
  matchWidthRef?: React.RefObject<HTMLElement | null>;
}

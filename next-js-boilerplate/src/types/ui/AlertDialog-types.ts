import type React from "react";

export interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export type AlertDialogTitleProps = React.ComponentPropsWithoutRef<"h2">;

export type AlertDialogDescriptionProps = React.ComponentPropsWithoutRef<"p">;

export type AlertDialogActionProps = React.ComponentPropsWithoutRef<"button">;

export type AlertDialogCancelProps = React.ComponentPropsWithoutRef<"button">;

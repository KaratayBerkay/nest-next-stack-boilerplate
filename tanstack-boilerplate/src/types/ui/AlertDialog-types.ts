import type React from "react";
import type { Trigger } from "@radix-ui/react-alert-dialog";
import type {
  Variant as ButtonVariant,
  Size as ButtonSize,
} from "@/components/ui/button-styles";

export interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Shared by Trigger/Cancel/Action — all three render Radix's own <button>,
 * so all three take the same variant/size vocabulary as `Button` and should
 * look identical given the same variant.
 */
export type AlertDialogButtonProps = React.ComponentPropsWithoutRef<
  typeof Trigger
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export type AlertDialogTriggerProps = AlertDialogButtonProps;

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

export type AlertDialogActionProps = AlertDialogButtonProps;

export type AlertDialogCancelProps = AlertDialogButtonProps;

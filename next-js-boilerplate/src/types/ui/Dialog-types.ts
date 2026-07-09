import type React from "react";
import type { ReactNode } from "react";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export type DialogFooterProps = React.ComponentPropsWithoutRef<"div">;

export type DialogTriggerProps = React.ComponentPropsWithoutRef<"button">;

export type DialogHeaderProps = React.ComponentPropsWithoutRef<"div">;

export type DialogDescriptionProps = React.ComponentPropsWithoutRef<"p">;

export type DialogCloseProps = React.ComponentPropsWithoutRef<"button">;

export type DialogTitleProps = React.ComponentPropsWithoutRef<"h2">;

import type React from "react";

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  defaultOpen?: boolean;
}

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export interface SelectContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  sideOffset?: number;
}

export interface SelectItemProps extends React.ComponentPropsWithoutRef<"button"> {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export type SelectVariant = "default";

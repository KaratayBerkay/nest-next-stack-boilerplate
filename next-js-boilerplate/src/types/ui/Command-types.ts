import type React from "react";

export interface CommandProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: CommandVariant;
  className?: string;
}

export type CommandVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export interface CommandInputProps extends React.ComponentPropsWithoutRef<"input"> {
  className?: string;
}

export interface CommandListProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export interface CommandEmptyProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export interface CommandGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export interface CommandItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

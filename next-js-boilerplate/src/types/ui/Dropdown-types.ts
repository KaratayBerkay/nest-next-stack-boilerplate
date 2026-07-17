import type React from "react";
import type { SelectSize, SelectVariant } from "./Select-types";

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: DropdownVariant;
  size?: SelectSize;
  disabled?: boolean;
  name?: string;
  error?: string;
  description?: string;
  "aria-label"?: string;
}

export type DropdownVariant = SelectVariant;

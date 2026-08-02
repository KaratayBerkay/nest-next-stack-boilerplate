import type { ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

export interface IconFieldProps {
  field: AnyFieldApi;
  label: string;
  info: string;
  placeholder: string;
  leftIcon: ReactNode;
  type?: string;
}

import type React from "react";

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  as?: "h1" | "h2";
  titleClassName?: string;
  className?: string;
}

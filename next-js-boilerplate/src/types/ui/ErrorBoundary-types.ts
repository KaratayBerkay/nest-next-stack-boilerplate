import type React from "react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: ErrorBoundaryVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ErrorBoundaryVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

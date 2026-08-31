import type React from "react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

"use client";

import { Component } from "react";
import { cn } from "@/lib/cn";
import type { ErrorBoundaryProps, ErrorBoundaryVariant } from "@/types/ui/ErrorBoundary-types";

interface State {
  hasError: boolean;
  error: Error | null;
}

const variants: Record<ErrorBoundaryVariant, string> = {
  default: "text-fg",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    const { fontSize, fontWeight, fontFamily, fallback } = this.props;
    const fontSizeClass = fontSize || "text-sm";
    const fontWeightClass = fontWeight || "font-medium";
    const fontFamilyClass = fontFamily || "font-sans";

    if (this.state.hasError) {
      const variantClass = variants[this.props.variant || "default"];
      return (
        fallback || (
          <div className={cn(
            "flex flex-col items-center justify-center gap-2 py-12",
            variantClass,
            fontSizeClass,
            fontWeightClass,
            fontFamilyClass,
          )}>
            <p>Something went wrong</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-surface hover:bg-surface-hover rounded px-3 py-1 text-xs"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

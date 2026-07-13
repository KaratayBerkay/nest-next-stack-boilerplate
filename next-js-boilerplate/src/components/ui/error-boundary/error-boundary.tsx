"use client";

import { Component } from "react";
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { ErrorBoundaryProps } from "@/types/ui/ErrorBoundary-types";

interface State {
  hasError: boolean;
  error: Error | null;
}

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
    const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

    if (this.state.hasError) {
      return (
        fallback || (
          <div className={cn(
            "text-fg flex flex-col items-center justify-center gap-2 py-12",
            fonts,
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

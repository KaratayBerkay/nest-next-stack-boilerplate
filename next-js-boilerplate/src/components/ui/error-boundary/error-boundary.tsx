"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="text-sm text-red-500">Something went wrong</p>
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

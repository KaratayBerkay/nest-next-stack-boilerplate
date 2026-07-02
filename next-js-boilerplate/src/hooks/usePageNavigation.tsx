"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  matchPage,
  buildPath,
  getPageNode,
  type PageNode,
} from "@/lib/navigation/page-registry";

export type SuggestDirection = "back" | "forward" | null;

type Suggestion = {
  direction: SuggestDirection;
  targetPage: PageNode;
  progress: number;
};

type PageNavigationContextValue = {
  currentPage: PageNode | null;
  suggestion: Suggestion | null;
  suggestNavigation: (direction: SuggestDirection, progress: number) => void;
  commitNavigation: (direction: SuggestDirection) => void;
  cancelSuggestion: () => void;
  backPage: PageNode | null;
  forwardPage: PageNode | null;
};

const PageNavigationContext = createContext<PageNavigationContextValue | null>(
  null,
);

export function PageNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<PageNode | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    const matched = matchPage(pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(matched);
    setSuggestion(null);
  }, [pathname]);

  const backPage: PageNode | null = useMemo(
    () =>
      currentPage?.backId ? (getPageNode(currentPage.backId) ?? null) : null,
    [currentPage],
  );

  const forwardPage: PageNode | null = useMemo(
    () =>
      currentPage?.forwardId
        ? (getPageNode(currentPage.forwardId) ?? null)
        : null,
    [currentPage],
  );

  const navigateTo = useCallback(
    (targetPage: PageNode) => {
      const resolved = buildPath(targetPage, pathname);
      if (resolved) {
        router.push(resolved);
      }
    },
    [pathname, router],
  );

  const navigateToRef = useRef(navigateTo);

  useEffect(() => {
    navigateToRef.current = navigateTo;
  }, [navigateTo]);

  const suggestNavigation = useCallback(
    (direction: SuggestDirection, progress: number) => {
      const targetPage =
        direction === "back"
          ? backPage
          : direction === "forward"
            ? forwardPage
            : null;

      if (!targetPage) return;

      setSuggestion((prev) => {
        if (!prev || prev.targetPage.id !== targetPage.id) {
          return { direction, targetPage, progress };
        }
        return { ...prev, progress };
      });
    },
    [backPage, forwardPage],
  );

  const commitNavigation = useCallback(
    (direction: SuggestDirection) => {
      const targetPage =
        direction === "back"
          ? backPage
          : direction === "forward"
            ? forwardPage
            : null;

      if (!targetPage) return;

      setSuggestion(null);
      navigateToRef.current(targetPage);
    },
    [backPage, forwardPage],
  );

  const cancelSuggestion = useCallback(() => {
    setSuggestion(null);
  }, []);

  return (
    <PageNavigationContext.Provider
      value={{
        currentPage,
        suggestion,
        suggestNavigation,
        commitNavigation,
        cancelSuggestion,
        backPage,
        forwardPage,
      }}
    >
      {children}
    </PageNavigationContext.Provider>
  );
}

export function usePageNavigation(): PageNavigationContextValue {
  const ctx = useContext(PageNavigationContext);
  if (!ctx) {
    throw new Error(
      "usePageNavigation must be used within a PageNavigationProvider",
    );
  }
  return ctx;
}

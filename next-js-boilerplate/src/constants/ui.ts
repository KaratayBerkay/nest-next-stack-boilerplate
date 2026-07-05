export const SWIPE_THRESHOLD = 50;

export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

export const QUERY_DEFAULTS = {
  staleTime: 5 * 60 * 1000,
  retry: 1,
} as const;

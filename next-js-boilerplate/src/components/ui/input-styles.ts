export const inputBaseClasses =
  "border-border placeholder:text-muted focus-visible:ring-brand flex h-9 w-full rounded border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const inputErrorClasses =
  "border-red-500 focus-visible:ring-red-500 dark:border-red-500";

export const inputVariants = {
  default: "border-border focus-visible:ring-brand",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 focus-visible:ring-blue-500 text-white placeholder:text-slate-500",
  glass: "bg-white/5 backdrop-blur-md border-white/20 focus-visible:ring-white/50 text-white placeholder:text-slate-400",
  neon: "bg-slate-950/90 border-cyan-500/30 focus-visible:ring-cyan-400 text-cyan-400 placeholder:text-slate-600 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 border-transparent focus-visible:ring-gradient text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 placeholder:text-slate-600",
} as const;

export const inputSizes = {
  sm: "h-8 text-xs px-2 py-1.5",
  md: "h-9 text-sm px-3 py-2",
  lg: "h-10 text-base px-4 py-2",
} as const;

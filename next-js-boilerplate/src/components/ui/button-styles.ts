export const variants = {
  default: "bg-surface text-fg hover:bg-surface-hover border border-border",
  primary: "bg-brand text-brand-fg hover:opacity-90",
  secondary: "bg-surface text-fg hover:bg-surface-hover",
  outline: "border border-border bg-transparent hover:bg-surface-hover",
  ghost: "bg-transparent hover:bg-surface-hover",
  destructive: "bg-error text-error-fg hover:opacity-90 border border-error",
  link: "text-brand underline-offset-4 hover:underline",
  soft: "bg-brand/15 text-brand hover:bg-brand/20 border border-brand/30",
  shadow: "bg-fg text-bg hover:opacity-90 shadow-md",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400 shadow-lg shadow-blue-500/20 border border-transparent",
  glass: "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20",
  neon: "bg-slate-950 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 border border-transparent shadow-2xl shadow-purple-500/10",
} as const;

export const sizes = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-xs": "size-7",
} as const;

export type Variant = keyof typeof variants;
export type Size = keyof typeof sizes;

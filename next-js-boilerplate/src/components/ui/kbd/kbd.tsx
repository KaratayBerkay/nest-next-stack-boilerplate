import { cn } from "@/lib/cn";
export function Kbd({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "bg-surface border-border pointer-events-none inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-100 select-none",
        className,
      )}
      {...props}
    />
  );
}

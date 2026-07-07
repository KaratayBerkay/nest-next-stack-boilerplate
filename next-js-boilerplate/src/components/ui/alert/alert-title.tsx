import { cn } from "@/lib/cn";

export function AlertTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h5">) {
  return (
    <h5
      className={cn("mb-1 leading-none font-medium tracking-tight", className)}
      {...props}
    />
  );
}

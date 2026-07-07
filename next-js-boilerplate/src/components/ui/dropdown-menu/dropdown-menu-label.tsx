import { cn } from "@/lib/cn";

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("text-muted px-2 py-1.5 text-xs font-medium", className)}
      {...props}
    />
  );
}

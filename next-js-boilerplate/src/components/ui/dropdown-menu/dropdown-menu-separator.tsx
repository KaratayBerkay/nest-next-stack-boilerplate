import { cn } from "@/lib/cn";

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

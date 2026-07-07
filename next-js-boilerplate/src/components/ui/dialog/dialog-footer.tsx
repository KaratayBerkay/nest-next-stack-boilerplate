import { cn } from "@/lib/cn";

type DialogFooterProps = React.ComponentPropsWithoutRef<"div">;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 pt-2", className)}
      {...props}
    />
  );
}

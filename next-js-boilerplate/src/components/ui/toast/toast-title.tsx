import { cn } from "@/lib/cn";

export function ToastTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("text-sm font-semibold", className)} {...props} />;
}

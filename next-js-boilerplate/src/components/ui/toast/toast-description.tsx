import { cn } from "@/lib/cn";

export function ToastDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}

import { cn } from "@/lib/cn";

type DialogDescriptionProps = React.ComponentPropsWithoutRef<"p">;

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return <p className={cn("text-muted text-sm", className)} {...props} />;
}

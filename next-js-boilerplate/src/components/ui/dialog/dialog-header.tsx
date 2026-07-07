import { cn } from "@/lib/cn";

type DialogHeaderProps = React.ComponentPropsWithoutRef<"div">;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
  );
}

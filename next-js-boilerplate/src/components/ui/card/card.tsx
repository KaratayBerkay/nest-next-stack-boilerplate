import { cn } from "@/lib/cn";

type CardProps = React.ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "@container",
        "border-border bg-bg text-fg rounded-xl border shadow-sm transition-all hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

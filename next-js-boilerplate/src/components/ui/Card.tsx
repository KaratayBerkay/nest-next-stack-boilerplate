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

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4 @sm:p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={cn(
        "text-base leading-none font-semibold tracking-tight @sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn("text-muted text-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={cn("p-4 pt-0 @sm:p-6 @sm:pt-0", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 p-4 pt-0 @sm:flex-row @sm:items-center @sm:p-6 @sm:pt-0",
        className,
      )}
      {...props}
    />
  );
}

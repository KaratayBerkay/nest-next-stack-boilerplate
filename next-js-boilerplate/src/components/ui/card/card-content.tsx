import { cn } from "@/lib/cn";

type CardContentProps = React.ComponentPropsWithoutRef<"div">;

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div className={cn("p-4 pt-0 @sm:p-6 @sm:pt-0", className)} {...props} />
  );
}

import { cn } from "@/lib/cn";

type CardHeaderProps = React.ComponentPropsWithoutRef<"div">;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4 @sm:p-6", className)}
      {...props}
    />
  );
}

import { cn } from "@/lib/cn";

type CardTitleProps = React.ComponentPropsWithoutRef<"h3">;

export function CardTitle({ className, ...props }: CardTitleProps) {
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

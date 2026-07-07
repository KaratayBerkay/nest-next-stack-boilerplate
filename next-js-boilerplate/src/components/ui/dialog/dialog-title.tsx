import { cn } from "@/lib/cn";

type DialogTitleProps = React.ComponentPropsWithoutRef<"h2">;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

import { cn } from "@/lib/cn";

type CardDescriptionProps = React.ComponentPropsWithoutRef<"p">;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-muted text-sm", className)} {...props} />;
}

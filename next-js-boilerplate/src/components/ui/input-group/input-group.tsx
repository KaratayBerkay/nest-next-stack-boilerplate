import { cn } from "@/lib/cn";
export function InputGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props} />
  );
}

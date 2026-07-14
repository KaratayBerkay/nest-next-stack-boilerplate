import { cn } from "@/lib/cn";
export function InputGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex items-stretch first:rounded-l-md last:rounded-r-md [&>:first-child]:rounded-l-md [&>:last-child]:rounded-r-md [&>:not(:first-child)]:-ml-px [&>:not(:first-child)]:rounded-none [&>:focus-within]:ring-2 [&>:focus-within]:ring-brand [&>:focus-within]:z-10", className)} {...props} />
  );
}

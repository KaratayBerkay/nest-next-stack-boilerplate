import { cn } from "@/lib/cn";
export function InputGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "[&>:focus-within]:ring-brand flex items-stretch first:rounded-l-md last:rounded-r-md [&>:first-child]:rounded-l-md [&>:focus-within]:z-10 [&>:focus-within]:ring-2 [&>:last-child]:rounded-r-md [&>:not(:first-child)]:-ml-px [&>:not(:first-child)]:rounded-none",
        className,
      )}
      {...props}
    />
  );
}

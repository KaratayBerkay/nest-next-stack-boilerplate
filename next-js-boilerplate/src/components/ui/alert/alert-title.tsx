import { cn } from "@/lib/cn";

export function AlertTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h5">) {
  return (
    // jsx-a11y/heading-has-content can't see that `children` arrives via `{...props}` — this
    // is a generic wrapper, not a heading rendered without content.
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h5
      className={cn("mb-1 leading-none font-medium tracking-tight", className)}
      {...props}
    />
  );
}

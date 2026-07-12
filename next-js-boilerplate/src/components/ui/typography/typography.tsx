import { cn } from "@/lib/cn";
// jsx-a11y/heading-has-content can't see that `children` arrives via `{...props}` at each
// call site — these are generic wrappers, not headings rendered without content.
/* eslint-disable jsx-a11y/heading-has-content */
export function H1({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      {...props}
    />
  );
}
export function H2({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  );
}
export function H3({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
export function H4({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
/* eslint-enable jsx-a11y/heading-has-content */
export function Lead({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return <p className={cn("text-muted text-xl", className)} {...props} />;
}
export function Large({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("text-lg font-semibold", className)} {...props} />;
}
export function Small({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"small">) {
  return (
    <small
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  );
}
export function Muted({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return <p className={cn("text-muted text-sm", className)} {...props} />;
}
export function Code({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className={cn(
        "bg-surface relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className,
      )}
      {...props}
    />
  );
}
export function Quote({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className={cn("border-border mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  );
}

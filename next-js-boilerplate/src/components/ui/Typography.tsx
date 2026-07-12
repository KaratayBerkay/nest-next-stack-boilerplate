import { cn } from "@/lib/cn";
import type { TypographyProps } from "@/types/ui/Typography-types";

const variants = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  h5: "scroll-m-20 text-lg font-semibold tracking-tight",
  h6: "scroll-m-20 text-base font-semibold tracking-tight",
  body: "text-base leading-relaxed",
  bodyLarge: "text-lg leading-relaxed",
  bodySmall: "text-sm leading-relaxed",
  caption: "text-sm text-muted",
  overline: "text-xs font-semibold uppercase tracking-wider text-muted",
} as const;

const tags = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  bodyLarge: "p",
  bodySmall: "p",
  caption: "p",
  overline: "span",
} as const;

export function Typography({
  variant = "body",
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = as || tags[variant];

  return (
    <Component className={cn(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}

// Re-export the specific components for backwards compatibility
// jsx-a11y/heading-has-content can't see that `children` arrives via `{...props}` at each
// call site — these are generic wrappers, not headings rendered without content.
/* eslint-disable jsx-a11y/heading-has-content */
export function H1({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h1">) {
  return <h1 className={cn(variants.h1, className)} {...props} />;
}

export function H2({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn(variants.h2, className)} {...props} />;
}

export function H3({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return <h3 className={cn(variants.h3, className)} {...props} />;
}

export function H4({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h4">) {
  return <h4 className={cn(variants.h4, className)} {...props} />;
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

import { Children, cloneElement } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { variants, sizes } from "@/components/ui/button-styles";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import { Spinner } from "@/components/ui/Spinner";
import type { ButtonProps } from "@/types/ui/Button-types";

function ButtonContent({
  leftIcon,
  rightIcon,
  children,
}: {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </>
  );
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object")
        (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export function Button({
  variant,
  size = "md",
  className,
  disabled,
  fontSize,
  fontWeight,
  fontFamily,
  leftIcon,
  rightIcon,
  loading,
  asChild,
  children,
  ...props
}: ButtonProps) {
  const effectiveVariant = useComponentVariant(variant);
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontSize: sizes[size].split(" ")[2] },
  );

  const classes = cn(
    "relative inline-flex items-center justify-center gap-2 rounded-md shadow-xs transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none active:translate-y-px active:shadow-xs disabled:pointer-events-none disabled:opacity-50",
    resolveVariant(variants, effectiveVariant),
    className,
    fonts,
  );

  const sharedProps = {
    className: classes,
    disabled: disabled || loading,
    "aria-busy": loading || undefined,
  };

  if (asChild) {
    const child = Children.only(children) as React.ReactElement<{
      onClick?: React.MouseEventHandler;
      ref?: React.Ref<unknown>;
      className?: string;
    }>;
    const childOnClick = child.props.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined;
    const childRef = child.props.ref;
    const buttonOnClick = (props as React.ComponentPropsWithoutRef<"button">).onClick;
    return cloneElement(child, {
      ...sharedProps,
      ...props,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        childOnClick?.(e);
        if (!e.defaultPrevented) buttonOnClick?.(e);
      },
      ref: composeRefs(childRef, (props as { ref?: React.Ref<unknown> }).ref),
      className: cn(sharedProps.className, child.props.className),
    } as React.ComponentPropsWithoutRef<"button">);
  }

  return (
    <button {...sharedProps} {...props}>
      <span className={cn(loading && "invisible")}>
        <ButtonContent leftIcon={leftIcon} rightIcon={rightIcon}>
          {children}
        </ButtonContent>
      </span>
      {loading && (
        <span className="absolute inset-0 inline-flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}
    </button>
  );
}

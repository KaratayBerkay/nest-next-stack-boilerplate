import { Children, cloneElement } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { variants, sizes } from "@/components/ui/button-styles";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type { ButtonProps } from "@/types/ui/Button-types";

const Spinner = () => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      opacity="0.25"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

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
  const fonts = fontClasses({ fontSize: fontSize || sizes[size].split(" ")[2], fontWeight, fontFamily });

  const classes = cn(
    "focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded shadow-xs transition-all focus-visible:ring-2 focus-visible:outline-none active:shadow-xs disabled:pointer-events-none disabled:opacity-40",
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
    const child = Children.only(children) as React.ReactElement;
    const childClassName = (child.props as { className?: string }).className;
    return cloneElement(child, {
      ...sharedProps,
      ...props,
      className: cn(sharedProps.className, childClassName),
    } as React.ComponentPropsWithoutRef<"button">);
  }

  return (
    <button {...sharedProps} {...props}>
      {loading ? (
        <span className="inline-flex items-center justify-center">
          <Spinner />
        </span>
      ) : (
        <ButtonContent leftIcon={leftIcon} rightIcon={rightIcon}>
          {children}
        </ButtonContent>
      )}
    </button>
  );
}

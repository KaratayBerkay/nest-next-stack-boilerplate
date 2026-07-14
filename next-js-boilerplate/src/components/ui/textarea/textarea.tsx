import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useFieldMessages } from "@/components/ui/field-messages";
import type { TextareaProps } from "@/types/ui/Textarea-types";

const variants = {
  ...globalStyleVariants,
  default: "border-border focus-visible:ring-brand",
};

export function Textarea({
  className,
  error,
  description,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: TextareaProps) {
  const effectiveVariant = useComponentVariant(variant);
  const errorStr = typeof error === "string" ? error : undefined;
  const { describedBy, messages } = useFieldMessages(errorStr, description);

  return (
    <div className="flex flex-col gap-1">
      <textarea
        className={cn(
          "placeholder:text-muted/70 selection:bg-brand/20 focus-visible:ring-brand flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          resolveVariant(variants, effectiveVariant),
          error && "border-error focus-visible:ring-error",
          fontClasses({ fontSize, fontWeight, fontFamily }, { fontWeight: "font-normal" }),
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...props}
      />
      {messages}
    </div>
  );
}

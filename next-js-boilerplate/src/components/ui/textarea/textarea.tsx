import { cn } from "@/lib/cn";

interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  error?: string;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "border-border placeholder:text-muted focus-visible:ring-brand flex min-h-20 w-full rounded border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        error &&
          "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
        className,
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}

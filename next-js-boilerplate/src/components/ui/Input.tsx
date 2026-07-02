import { cn } from "@/lib/cn";

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-border placeholder:text-muted focus-visible:ring-brand flex h-9 w-full rounded border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        error &&
          "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
        className,
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}

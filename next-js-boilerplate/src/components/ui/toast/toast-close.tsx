import { cn } from "@/lib/cn";

export function ToastClose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(
        "text-muted hover:text-fg focus:ring-brand absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:ring-2 focus:outline-none",
        className,
      )}
      {...props}
    >
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <span className="sr-only">Close</span>
    </button>
  );
}

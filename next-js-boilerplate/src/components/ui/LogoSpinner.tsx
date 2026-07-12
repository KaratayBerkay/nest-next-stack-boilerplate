import { cn } from "@/lib/cn";

export function LogoSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center gap-6",
        className,
      )}
    >
      <svg
        className="text-brand size-12 animate-pulse"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="10"
          fill="currentColor"
          opacity="0.15"
        />
        <rect
          x="10"
          y="10"
          width="28"
          height="28"
          rx="7"
          fill="currentColor"
          opacity="0.3"
        />
        <rect x="16" y="16" width="16" height="16" rx="4" fill="currentColor" />
      </svg>
      <div className="flex gap-1">
        <span className="bg-brand size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
        <span className="bg-brand size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
        <span className="bg-brand size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  );
}

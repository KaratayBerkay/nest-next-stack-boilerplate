import { IconAlertCircle } from "@tabler/icons-react";
import type { MessageTickProps } from "@/types/components/MessageTick-types";

export function MessageTick({ status, failedLabel }: MessageTickProps) {
  if (status === "failed") {
    return (
      <IconAlertCircle
        size={12}
        className="text-error shrink-0"
        data-testid="tick-failed"
        role={failedLabel ? "img" : undefined}
        aria-label={failedLabel}
      />
    );
  }
  if (status === "read") {
    return (
      <svg
        viewBox="0 0 20 11"
        width="12"
        height="7"
        className="text-info fill-current drop-shadow-sm"
        data-testid="tick-read"
      >
        <path d="M5.5 7.5 2.5 4.5l-1 1 4 4 9-9-1-1z" />
        <path d="M11.5 7.5 8.5 4.5l-1 1 4 4 4-4-1-1z" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg
        viewBox="0 0 20 11"
        width="12"
        height="7"
        className="text-muted fill-current"
        data-testid="tick-delivered"
      >
        <path d="M5.5 7.5 2.5 4.5l-1 1 4 4 9-9-1-1z" />
        <path d="M11.5 7.5 8.5 4.5l-1 1 4 4 4-4-1-1z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 12 11"
      width="10"
      height="7"
      className="text-muted/60 fill-current"
      data-testid="tick-sent"
    >
      <path d="M5.5 8 1.5 4l-1 1 5 5 9-9-1-1z" />
    </svg>
  );
}

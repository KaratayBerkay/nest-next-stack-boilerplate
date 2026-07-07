"use client";

import { cn } from "@/lib/cn";
import { createPortal } from "react-dom";
import { useToastContext } from "./toast-provider";
import { Toast } from "./toast";

export function ToastViewport({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { state } = useToastContext();
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex w-full flex-col-reverse gap-2 p-4 sm:right-4 sm:bottom-4 sm:left-auto sm:w-auto sm:max-w-sm",
        className,
      )}
      {...props}
    >
      {state.map((item) => (
        <Toast key={item.id} id={item.id} />
      ))}
    </div>,
    document.body,
  );
}

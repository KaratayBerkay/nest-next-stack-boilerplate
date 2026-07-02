"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

function useDropdownMenuContext() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(
      "DropdownMenu components must be used within <DropdownMenu>",
    );
  }
  return ctx;
}

export function DropdownMenu({
  children,
}: React.ComponentPropsWithoutRef<"div">) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const setOpenSafe = useCallback((v: boolean) => {
    setOpen(v);
  }, []);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen: setOpenSafe, triggerRef }}
    >
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={() => setOpen(!open)}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    />
  );
}

export function DropdownMenuContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isDesktop = useBreakpoint("sm");

  useEffect(() => {
    if (open && triggerRef.current && isDesktop) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [open, triggerRef, isDesktop]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  useEffect(() => {
    if (open) {
      const handleKeyDown = (e: KeyboardEvent) => {
        const items = contentRef.current?.querySelectorAll<HTMLDivElement>(
          '[role="menuitem"]:not([data-disabled])',
        );
        if (!items?.length) return;

        const currentIndex = Array.from(items).findIndex(
          (item) => item === document.activeElement,
        );

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex]?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex]?.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  useEffect(() => {
    if (open && contentRef.current && isDesktop) {
      const firstItem = contentRef.current.querySelector<HTMLDivElement>(
        '[role="menuitem"]:not([data-disabled])',
      );
      firstItem?.focus();
    }
  }, [open, isDesktop]);

  if (!open) return null;

  return createPortal(
    <>
      {!isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        ref={contentRef}
        role="menu"
        data-state="open"
        style={
          isDesktop && position
            ? { position: "fixed", top: position.top, left: position.left }
            : undefined
        }
        className={cn(
          isDesktop
            ? "border-border bg-bg animate-fade-in-down z-50 min-w-44 origin-top-right rounded-xl border p-1 shadow-lg"
            : "bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4",
          className,
        )}
        {...props}
      >
        {!isDesktop && (
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm font-semibold">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:bg-surface-hover rounded-lg p-1"
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div
          className={cn(
            isDesktop ? "" : "flex flex-1 flex-col gap-0.5 overflow-y-auto",
          )}
        >
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}

interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<"div"> {
  disabled?: boolean;
}

export function DropdownMenuItem({
  disabled,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        setOpen(false);
        props.onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) {
            setOpen(false);
            (e.target as HTMLElement)?.click();
          }
        }
      }}
      className={cn(
        "relative flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors outline-none select-none",
        "hover:bg-surface-hover focus-visible:bg-surface-hover",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("text-muted px-2 py-1.5 text-xs font-medium", className)}
      {...props}
    />
  );
}

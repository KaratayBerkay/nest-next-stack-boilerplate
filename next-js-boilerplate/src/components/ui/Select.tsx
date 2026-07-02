"use client";

import { cn } from "@/lib/cn";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string | undefined;
  onValueChange: (value: string) => void;
  labelMap: React.MutableRefObject<Map<string, string>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelect() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  defaultOpen?: boolean;
}

export function Select({
  children,
  value,
  onValueChange,
  defaultOpen = false,
}: SelectProps) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelMap = useRef(new Map<string, string>());

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        onValueChange,
        labelMap,
        triggerRef,
        contentRef,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const { open, setOpen, triggerRef } = useSelect();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "border-border focus-visible:ring-brand flex h-9 w-full items-center justify-between gap-2 rounded border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => setOpen(!open)}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-haspopup="listbox"
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "text-muted shrink-0 transition-transform",
          open && "rotate-180",
        )}
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value, labelMap } = useSelect();
  const displayText = value ? labelMap.current.get(value) : undefined;

  return (
    <span className={cn("truncate", !displayText && "text-muted", className)}>
      {displayText ?? placeholder ?? ""}
    </span>
  );
}

interface SelectContentProps extends React.ComponentPropsWithoutRef<"div"> {
  sideOffset?: number;
}

export function SelectContent({
  className,
  children,
  sideOffset = 8,
  ...props
}: SelectContentProps) {
  const { open, setOpen, triggerRef, contentRef } = useSelect();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const isDesktop = useBreakpoint("sm");

  useEffect(() => {
    if (!open || !triggerRef.current || !isDesktop) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + sideOffset,
        left: triggerRect.left,
        width: triggerRect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, sideOffset, triggerRef, isDesktop]);

  useEffect(() => {
    if (!open || !isDesktop) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, setOpen, triggerRef, contentRef, isDesktop]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, triggerRef]);

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    const items = contentRef.current?.querySelectorAll('[role="option"]');
    if (!items || items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(
      (item) => item === document.activeElement,
    );

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        (items[next] as HTMLButtonElement).focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        (items[prev] as HTMLButtonElement).focus();
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (currentIndex >= 0) {
          (items[currentIndex] as HTMLButtonElement).click();
        }
        break;
      }
    }
  };

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
        role="listbox"
        style={
          isDesktop && position
            ? {
                position: "fixed",
                top: position.top,
                left: position.left,
                width: position.width,
              }
            : undefined
        }
        className={cn(
          isDesktop
            ? "border-border bg-bg animate-fade-in-down z-50 max-h-60 min-w-[8rem] origin-top-right overflow-y-auto rounded-lg border p-1 shadow-lg"
            : "bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4",
          className,
        )}
        onKeyDown={handleContentKeyDown}
        {...props}
      >
        {!isDesktop && (
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm font-semibold">Select</span>
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

interface SelectItemProps extends React.ComponentPropsWithoutRef<"button"> {
  value: string;
}

export function SelectItem({
  className,
  value: itemValue,
  children,
  ...props
}: SelectItemProps) {
  const { value, onValueChange, setOpen, triggerRef, labelMap } = useSelect();
  const itemRef = useRef<HTMLButtonElement>(null);
  const isSelected = value === itemValue;
  const text = typeof children === "string" ? children : "";

  useEffect(() => {
    const map = labelMap.current;
    map.set(itemValue, text);
    return () => {
      map.delete(itemValue);
    };
  }, [itemValue, text, labelMap]);

  const handleClick = () => {
    onValueChange(itemValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <button
      ref={itemRef}
      type="button"
      role="option"
      aria-selected={isSelected}
      className={cn(
        "focus-visible:bg-surface-hover relative flex w-full cursor-default items-center rounded px-2 py-1.5 text-sm transition-colors outline-none select-none focus-visible:outline-none",
        isSelected && "bg-surface-hover text-brand",
        !isSelected && "text-fg",
        className,
      )}
      onClick={handleClick}
      tabIndex={-1}
      {...props}
    >
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 shrink-0"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      <span className={cn(!isSelected && "ml-6")}>{children}</span>
    </button>
  );
}

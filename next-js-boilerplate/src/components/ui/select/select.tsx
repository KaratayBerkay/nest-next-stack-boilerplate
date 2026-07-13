"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { SelectProps } from "@/types/ui/Select-types";

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string | undefined;
  onValueChange: (value: string) => void;
  labelMap: React.MutableRefObject<Map<string, string>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  name?: string;
}

const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelect() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

export function Select({
  children,
  value,
  onValueChange,
  defaultOpen = false,
  name,
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
        name,
      }}
    >
      <div className="relative">
        {name && <input type="hidden" name={name} value={value ?? ""} />}
        {children}
      </div>
    </SelectContext.Provider>
  );
}

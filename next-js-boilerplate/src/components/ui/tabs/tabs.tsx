"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface TabsContextValue {
  activeValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue: string;
}

export function Tabs({ defaultValue, className, ...props }: TabsProps) {
  const [activeValue, setActiveValue] = useState(defaultValue);

  const onValueChange = useCallback((value: string) => {
    setActiveValue(value);
  }, []);

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange }}>
      <div className={cn(className)} {...props} />
    </TabsContext.Provider>
  );
}

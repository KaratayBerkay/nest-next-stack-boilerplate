"use client";

import { Empty } from "@/components/ui/Empty";
import { useCommandContext } from "./command";

export function CommandEmpty({
  children,
}: React.ComponentPropsWithoutRef<"div">) {
  const { filteredItems } = useCommandContext();
  if (filteredItems.length > 0) return null;

  return (
    <Empty
      title={typeof children === "string" ? children : "No results found."}
    />
  );
}

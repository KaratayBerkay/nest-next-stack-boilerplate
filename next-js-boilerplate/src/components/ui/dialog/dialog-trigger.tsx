"use client";

import { useDialog } from "./dialog";

type DialogTriggerProps = React.ComponentPropsWithoutRef<"button">;

export function DialogTrigger({ className, ...props }: DialogTriggerProps) {
  const { onOpenChange } = useDialog();

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    />
  );
}

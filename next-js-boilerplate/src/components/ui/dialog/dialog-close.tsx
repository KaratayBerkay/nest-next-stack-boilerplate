"use client";

import { useDialog } from "./dialog";

type DialogCloseProps = React.ComponentPropsWithoutRef<"button">;

export function DialogClose({ className, ...props }: DialogCloseProps) {
  const { onOpenChange } = useDialog();

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

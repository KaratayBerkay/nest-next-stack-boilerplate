"use client";

import { IconButtonSizeScale } from "@/views/ui/button/IconButtonSizeScale";
import { IconButtonRealActions } from "@/views/ui/button/IconButtonRealActions";

export function IconButtonsTab() {
  return (
    <div className="flex flex-col gap-6">
      <IconButtonSizeScale />
      <IconButtonRealActions />
    </div>
  );
}

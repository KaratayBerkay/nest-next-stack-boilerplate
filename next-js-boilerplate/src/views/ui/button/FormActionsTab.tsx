"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/Tooltip";
import type { Variant, Size } from "@/components/ui/button-styles";

function handleSave(setSaving: Dispatch<SetStateAction<boolean>>) {
  setSaving(true);
  setTimeout(() => setSaving(false), 1500);
}

const FORM_VARIANTS: { variant: Variant; label: string }[] = [
  { variant: "default", label: "Default" },
  { variant: "primary", label: "Primary" },
  { variant: "secondary", label: "Secondary" },
  { variant: "outline", label: "Outline" },
  { variant: "ghost", label: "Ghost" },
  { variant: "destructive", label: "Destructive" },
  { variant: "link", label: "Link" },
  { variant: "soft", label: "Soft" },
  { variant: "shadow", label: "Shadow" },
];

const FORM_SIZES: { size: Size; label: string }[] = [
  { size: "xs", label: "XS" },
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
];

export function FormActionsTab() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          {FORM_VARIANTS.map(({ variant, label }) => (
            <Tooltip key={variant}>
              <TooltipTrigger>
                <Button variant={variant}>{label}</Button>
              </TooltipTrigger>
              <TooltipContent>variant=&quot;{variant}&quot;</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          {FORM_SIZES.map(({ size, label }) => (
            <Tooltip key={size}>
              <TooltipTrigger>
                <Button size={size}>{label}</Button>
              </TooltipTrigger>
              <TooltipContent>size=&quot;{size}&quot;</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Loading & Disabled</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="primary"
                onClick={() => handleSave(setSaving)}
                loading={saving}
              >
                Save Changes
              </Button>
            </TooltipTrigger>
            <TooltipContent>Simulates a 1.5s save</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">Cancel</Button>
            </TooltipTrigger>
            <TooltipContent>Dismiss without saving</TooltipContent>
          </Tooltip>
          <Button disabled>Disabled</Button>
        </div>
      </section>
    </div>
  );
}

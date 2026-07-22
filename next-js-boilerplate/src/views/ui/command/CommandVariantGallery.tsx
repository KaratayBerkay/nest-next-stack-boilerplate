"use client";

import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/Command";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";

export function CommandVariantGallery() {
  return (
    <VariantGallery
      variants={["default"]}
      sizes={["sm", "md", "lg"]}
      render={(variant, size) => (
        <div className="flex items-center gap-2">
          <Command className="border-border w-full max-w-40">
            <CommandInput placeholder="Search…" className="h-7 text-xs" />
            <CommandList>
              <CommandItem value="item" onSelect={() => {}} className="text-xs">
                {variant} / {size}
              </CommandItem>
            </CommandList>
          </Command>
        </div>
      )}
    />
  );
}

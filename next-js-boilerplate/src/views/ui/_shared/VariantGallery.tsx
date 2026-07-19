"use client";

import { globalStyleVariants } from "@/components/ui/global-style-variants";
import type { VariantGalleryProps } from "@/types/ui/VariantGallery-types";

const ALL_VARIANTS = ["default", ...Object.keys(globalStyleVariants)];

export function VariantGallery({
  variants,
  sizes,
  render,
  title = "Variant Gallery",
}: VariantGalleryProps) {
  const effectiveVariants = ALL_VARIANTS.filter(
    (v) => variants.includes(v) || v === "default",
  );
  const componentVariants = variants.filter(
    (v) => v !== "default" && !Object.keys(globalStyleVariants).includes(v),
  );
  const allVariants = [...effectiveVariants, ...componentVariants];
  // Components without a size prop pass sizes={[]} — still render one preview column.
  const effectiveSizes = sizes.length > 0 ? sizes : [""];

  return (
    <div className="flex flex-col gap-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-muted px-2 py-1.5 text-left text-xs font-medium">
                Variant
              </th>
              {effectiveSizes.map((size) => (
                <th
                  key={size}
                  className="text-muted px-2 py-1.5 text-left text-xs font-medium capitalize"
                >
                  {size || "Preview"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allVariants.map((variant) => {
              return (
                <tr key={variant}>
                  <td className="text-muted px-2 py-1.5 text-xs whitespace-nowrap">
                    {variant}
                  </td>
                  {effectiveSizes.map((size) => (
                    <td key={`${variant}-${size}`} className="px-2 py-1">
                      {render(variant, size)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

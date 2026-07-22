import { VariantCard } from "./VariantCard";
import { SizeCard } from "./SizeCard";
import { VariantCombinationTable } from "./VariantCombinationTable";
import { variants, sizes } from "./variant-gallery-data";

export function VariantGalleryTab() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-1 text-lg font-semibold">Card Variants</h3>
        <p className="text-muted mb-4 text-sm">
          Six visual styles for different contexts: default for general use,
          elevated for emphasis, interactive for clickable cards, outline for
          lightweight separation, surface for content areas, and soft for subtle
          tinting.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {variants.map((variant) => (
            <VariantCard key={variant} variant={variant} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-lg font-semibold">Sizes</h3>
        <p className="text-muted mb-4 text-sm">
          Three padding sizes control internal spacing without changing the
          card&apos;s visual style.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          {sizes.map((size) => (
            <SizeCard key={size} size={size} />
          ))}
        </div>
      </div>

      <VariantCombinationTable />
    </div>
  );
}

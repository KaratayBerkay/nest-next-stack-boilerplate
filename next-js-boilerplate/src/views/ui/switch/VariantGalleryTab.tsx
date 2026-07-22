import { Switch } from "@/components/ui/Switch";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { SwitchVariant, SwitchSize } from "@/types/ui/Switch-types";

export function VariantGalleryTab() {
  return (
    <VariantGallery
      variants={["default", "shiny", "glass", "neon", "gradient"]}
      sizes={["sm", "md", "lg"]}
      render={(variant, size) => (
        <Switch
          variant={variant as SwitchVariant}
          switchSize={size as SwitchSize}
          defaultChecked
        />
      )}
    />
  );
}

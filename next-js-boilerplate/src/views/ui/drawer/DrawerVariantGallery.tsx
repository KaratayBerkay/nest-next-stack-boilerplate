import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/Drawer";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { GlobalVariant } from "@/components/ui/global-style-variants";

export function DrawerVariantGallery() {
  return (
    <section className="flex flex-col gap-3">
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <div className="flex items-center gap-2">
            <Drawer>
              <DrawerTrigger className="bg-brand text-brand-fg rounded px-3 py-1.5 text-xs font-medium">
                Open
              </DrawerTrigger>
              <DrawerContent
                variant={
                  variant === "default" ? undefined : (variant as GlobalVariant)
                }
              >
                <DrawerHeader>
                  <DrawerTitle>{variant}</DrawerTitle>
                  <DrawerDescription>Drawer variant demo</DrawerDescription>
                </DrawerHeader>
                <div className="text-muted px-4 py-2 text-sm">
                  Content for the {variant} variant.
                </div>
                <DrawerFooter>
                  <DrawerClose className="border-border rounded border px-3 py-1.5 text-xs">
                    Close
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      />
    </section>
  );
}

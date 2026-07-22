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

export function DrawerVariantGallery() {
  return (
    <section className="flex flex-col gap-3">
      <VariantGallery
        variants={["default"]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <div className="flex items-center gap-2">
            <Drawer>
              <DrawerTrigger className="bg-brand rounded px-3 py-1.5 text-xs font-medium text-brand-fg">
                Open
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    {variant} / {size}
                  </DrawerTitle>
                  <DrawerDescription>Drawer variant demo</DrawerDescription>
                </DrawerHeader>
                <div className="text-muted px-4 py-2 text-sm">
                  Content for {variant} variant at {size} size.
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

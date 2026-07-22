"use client";

import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";

export function ToastGalleryContent() {
  const { toast } = useToast();
  return (
    <VariantGallery
      variants={["default", "info", "success", "warning", "destructive"]}
      sizes={["md"]}
      render={(variant, _size) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: `${variant} toast`,
              description: `This is a ${variant} toast.`,
              variant: variant as
                | "default"
                | "info"
                | "success"
                | "warning"
                | "destructive",
            })
          }
        >
          {variant}
        </Button>
      )}
    />
  );
}

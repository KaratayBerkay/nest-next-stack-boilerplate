import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogBody,
} from "@/components/ui/Dialog";

export function SizeScaleTab() {
  const sizes = ["sm", "md", "lg", "full"] as const;

  return (
    <div className="flex flex-wrap gap-3">
      {sizes.map((s) => (
        <Dialog key={s}>
          <DialogTrigger variant="outline">{s}</DialogTrigger>
          <DialogContent size={s}>
            <DialogHeader>
              <DialogTitle>Size: {s}</DialogTitle>
              <DialogDescription>
                This dialog uses the &ldquo;{s}&rdquo; size preset.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-muted text-sm">
                Content area with scroll-fade treatment.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

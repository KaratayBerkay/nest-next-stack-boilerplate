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
          <DialogTrigger className="border-border hover:bg-surface-hover focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded-md border bg-transparent px-4 py-2 text-sm font-medium shadow-xs transition-all focus-visible:ring-2 focus-visible:outline-none">
            {s}
          </DialogTrigger>
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
              <DialogClose className="border-border hover:bg-surface-hover inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors">
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

import type { useToast } from "@/components/ui/Toast";

export const SAMPLE_TEXT =
  "Right-click this paragraph to see contextual actions. You can copy this text to your clipboard, share it, or delete it.";

export const files = [
  { name: "report.pdf", size: "2.4 MB", date: "2026-07-12" },
  { name: "photo.jpg", size: "1.1 MB", date: "2026-07-10" },
  { name: "notes.txt", size: "12 KB", date: "2026-07-08" },
];

export function handleCopy(text: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: "Text copied to clipboard." });
}

export function handleShare(toast: ReturnType<typeof useToast>["toast"]) {
  toast({ title: "Shared", description: "Share link copied to clipboard." });
}

export function handleRename(toast: ReturnType<typeof useToast>["toast"]) {
  toast({ title: "Renamed", description: "File renamed successfully." });
}

export function handleDuplicate(toast: ReturnType<typeof useToast>["toast"]) {
  toast({ title: "Duplicated", description: "File duplicated successfully." });
}

"use client";

// Shared mobile bottom-sheet presentation for popover/dropdown/select
// mobile branches (C4). Not a standalone overlay — the consumer owns
// portal, backdrop, and dismiss behavior.

export const bottomSheetClasses =
  "fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-bg border border-border shadow-lg pb-safe max-h-[85vh] overflow-y-auto p-4 animate-slide-in-up";

export function BottomSheetHandle() {
  return <div className="bg-border mx-auto mb-2 h-1.5 w-8 rounded-full" />;
}

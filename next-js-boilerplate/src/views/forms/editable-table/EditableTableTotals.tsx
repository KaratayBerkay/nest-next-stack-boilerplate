"use client";

import type { EditableTableTotalsProps } from "@/types/forms/EditableTableTotals-types";

export function EditableTableTotals({ totals, t }: EditableTableTotalsProps) {
  return (
    <div className="flex flex-col gap-1 self-end text-xs">
      <div className="flex justify-between gap-8">
        <span>{t.editableTable.subtotal}</span>
        <span>${totals.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between gap-8">
        <span>{t.editableTable.tax}</span>
        <span>${totals.tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between gap-8 font-semibold">
        <span>{t.editableTable.total}</span>
        <span>${totals.total.toFixed(2)}</span>
      </div>
    </div>
  );
}

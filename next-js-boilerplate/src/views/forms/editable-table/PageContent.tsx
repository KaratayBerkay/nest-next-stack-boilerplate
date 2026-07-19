"use client";

import { useCallback, useState, useMemo } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";

interface TableRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxClass: "standard" | "reduced" | "zero";
}

const TAX_RATES = { standard: 0.2, reduced: 0.08, zero: 0 };

let nextRowId = 4;

const INITIAL_ROWS: TableRow[] = [
  { id: "1", description: "Widget A", quantity: 2, unitPrice: 29.99, taxClass: "standard" },
  { id: "2", description: "Gadget B", quantity: 1, unitPrice: 49.99, taxClass: "reduced" },
  { id: "3", description: "Service C", quantity: 5, unitPrice: 9.99, taxClass: "zero" },
];

export default function EditableTablePage() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const [rows, setRows] = useState<TableRow[]>(INITIAL_ROWS);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const updateRow = useCallback((id: string, patch: Partial<TableRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      { id: String(nextRowId++), description: "", quantity: 1, unitPrice: 0, taxClass: "standard" },
    ]);
  }, []);

  const duplicateRow = useCallback((id: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const copy = { ...source, id: String(nextRowId++), description: `${source.description} (copy)` };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const moveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    setRows((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((idx: number) => {
    setRows((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);
    const tax = rows.reduce((sum, r) => sum + r.quantity * r.unitPrice * TAX_RATES[r.taxClass], 0);
    return { subtotal, tax, total: subtotal + tax };
  }, [rows]);

  const handleSaveAll = useCallback(async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
    toast({ description: t.editableTable.saveSuccess, variant: "default" });
  }, [toast, t]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.editableTable.heading}</h2>
      </div>

      {formError && <FormErrorBanner message={formError} onDismiss={() => setFormError(null)} />}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted text-xxs">
              <th className="px-2 py-1 text-left font-medium">{t.editableTable.description}</th>
              <th className="px-2 py-1 text-right font-medium">{t.editableTable.quantity}</th>
              <th className="px-2 py-1 text-right font-medium">{t.editableTable.unitPrice}</th>
              <th className="px-2 py-1 font-medium">{t.editableTable.taxClass}</th>
              <th className="px-2 py-1 text-right font-medium">Net</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const net = row.quantity * row.unitPrice;
              return (
                <tr key={row.id} className="border-b border-border">
                  <td className="px-2 py-1">
                    <input
                      className="w-32 rounded border border-border bg-field px-1.5 py-1 text-xs"
                      value={row.description}
                      onChange={(e) => updateRow(row.id, { description: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      className="w-16 rounded border border-border bg-field px-1.5 py-1 text-xs text-right"
                      value={row.quantity}
                      min={0}
                      onChange={(e) => updateRow(row.id, { quantity: Math.max(0, Number(e.target.value)) })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      step="0.01"
                      className="w-20 rounded border border-border bg-field px-1.5 py-1 text-xs text-right"
                      value={row.unitPrice}
                      min={0}
                      onChange={(e) => updateRow(row.id, { unitPrice: Math.max(0, Number(e.target.value)) })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <select
                      className="rounded border border-border bg-field px-1.5 py-1 text-xs"
                      value={row.taxClass}
                      onChange={(e) => updateRow(row.id, { taxClass: e.target.value as TableRow["taxClass"] })}
                    >
                      <option value="standard">Standard (20%)</option>
                      <option value="reduced">Reduced (8%)</option>
                      <option value="zero">Zero (0%)</option>
                    </select>
                  </td>
                  <td className="px-2 py-1 text-right">${net.toFixed(2)}</td>
                  <td className="px-2 py-1">
                    <div className="flex gap-1">
                      <button className="text-muted hover:text-fg" onClick={() => duplicateRow(row.id)} title={t.editableTable.duplicateRow}>⧉</button>
                      <button className="text-muted hover:text-fg" disabled={idx === 0} onClick={() => moveUp(idx)} title={t.editableTable.moveUp}>↑</button>
                      <button className="text-muted hover:text-fg" disabled={idx >= rows.length - 1} onClick={() => moveDown(idx)} title={t.editableTable.moveDown}>↓</button>
                      <button className="text-destructive" onClick={() => removeRow(row.id)} title={t.editableTable.removeRow}>×</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={addRow}>{t.editableTable.addRow}</Button>

      <Separator />

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

      <div>
        <Button onClick={handleSaveAll} loading={saving}>
          {saving ? t.editableTable.saving : t.editableTable.saveAll}
        </Button>
      </div>
    </div>
  );
}

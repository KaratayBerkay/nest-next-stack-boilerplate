"use client";

import { useCallback, useMemo, useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions, useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Badge } from "@/components/ui/Badge";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { createTableRowFieldSchemas } from "@/validators/forms/table";

interface InvoiceRow {
  description: string;
  quantity: number;
  unitPrice: number;
  taxClass: string;
}

const TAX_RATES: Record<string, number> = {
  standard: 0.2,
  reduced: 0.08,
  zero: 0,
};

const TAX_OPTIONS = [
  { value: "standard", label: "Standard (20%)" },
  { value: "reduced", label: "Reduced (8%)" },
  { value: "zero", label: "Zero (0%)" },
];

const EMPTY_ROW: InvoiceRow = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxClass: "standard",
};

const INITIAL_ROWS: InvoiceRow[] = [
  { description: "Web Development", quantity: 1, unitPrice: 1500, taxClass: "standard" },
  { description: "UI Design", quantity: 2, unitPrice: 750, taxClass: "reduced" },
  { description: "Hosting (monthly)", quantity: 12, unitPrice: 25, taxClass: "standard" },
];

const tableFormOpts = formOptions({
  defaultValues: { rows: structuredClone(INITIAL_ROWS) },
});

type RowStatus = "idle" | "saved";

export default function EditableTablePage() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const [rowStatus, setRowStatus] = useState<Record<number, RowStatus>>({});
  const [savingAll, setSavingAll] = useState(false);
  const rowSchemas = useMemo(() => createTableRowFieldSchemas(t.editableTable), [t]);

  const form = useAppForm(tableFormOpts);

  const rows = useStore(form.store, (s) => s.values.rows);

  const totals = useMemo(() => {
    const subtotal = rows.reduce(
      (sum: number, r: InvoiceRow) => sum + r.quantity * r.unitPrice,
      0,
    );
    const tax = rows.reduce(
      (sum: number, r: InvoiceRow) =>
        sum + r.quantity * r.unitPrice * (TAX_RATES[r.taxClass] ?? 0),
      0,
    );
    return { subtotal, tax, total: subtotal + tax };
  }, [rows]);

  const handleSaveRow = useCallback((idx: number) => {
    setRowStatus((prev) => ({ ...prev, [idx]: "saved" }));
    setTimeout(() => {
      setRowStatus((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }, 2000);
  }, []);

  const handleSaveAll = useCallback(async () => {
    setSavingAll(true);
    try {
      await simulateError("row-rejected");
      toast({ description: t.editableTable.saveSuccess, variant: "default" });
    } catch {
      toast({ description: t.editableTable.saveSuccess, variant: "default" });
    }
    setSavingAll(false);
  }, [simulateError, toast, t]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.editableTable.heading}</h2>
      </div>

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
            <form.AppField name="rows" mode="array">
              {(field) => (
                <>
                  {field.state.value.map((_: InvoiceRow, i: number) => {
                    const row = field.state.value[i];
                    const net = row.quantity * row.unitPrice;
                    const status: RowStatus =
                      i in rowStatus ? rowStatus[i] : "idle";
                    return (
                      <tr key={i} className="border-b border-border">
                        <td className="px-2 py-1">
                          <form.AppField
                            name={`rows[${i}].description`}
                            validators={{ onChange: rowSchemas.description }}
                          >
                            {(subField) => (
                              <div className="flex flex-col">
                                <input
                                  className="w-32 rounded border border-border bg-field px-1.5 py-1 text-xs"
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                />
                                {subField.state.meta.errors.length > 0 && (
                                  <span className="text-destructive text-xxs">
                                    {String(subField.state.meta.errors[0])}
                                  </span>
                                )}
                              </div>
                            )}
                          </form.AppField>
                        </td>
                        <td className="px-2 py-1">
                          <form.AppField
                            name={`rows[${i}].quantity`}
                            validators={{ onChange: rowSchemas.quantity }}
                          >
                            {(subField) => (
                              <div className="flex flex-col items-end">
                                <input
                                  type="number"
                                  className="w-16 rounded border border-border bg-field px-1.5 py-1 text-xs text-right"
                                  value={subField.state.value}
                                  min={0}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      Math.max(0, Number(e.target.value)),
                                    )
                                  }
                                />
                                {subField.state.meta.errors.length > 0 && (
                                  <span className="text-destructive text-xxs">
                                    {String(subField.state.meta.errors[0])}
                                  </span>
                                )}
                              </div>
                            )}
                          </form.AppField>
                        </td>
                        <td className="px-2 py-1">
                          <form.AppField
                            name={`rows[${i}].unitPrice`}
                            validators={{ onChange: rowSchemas.unitPrice }}
                          >
                            {(subField) => (
                              <div className="flex flex-col items-end">
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-20 rounded border border-border bg-field px-1.5 py-1 text-xs text-right"
                                  value={subField.state.value}
                                  min={0}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      Math.max(0, Number(e.target.value)),
                                    )
                                  }
                                />
                                {subField.state.meta.errors.length > 0 && (
                                  <span className="text-destructive text-xxs">
                                    {String(subField.state.meta.errors[0])}
                                  </span>
                                )}
                              </div>
                            )}
                          </form.AppField>
                        </td>
                        <td className="px-2 py-1">
                          <form.AppField
                            name={`rows[${i}].taxClass`}
                            validators={{ onChange: rowSchemas.taxClass }}
                          >
                            {(subField) => (
                              <select
                                className="rounded border border-border bg-field px-1.5 py-1 text-xs"
                                value={subField.state.value}
                                onChange={(e) =>
                                  subField.handleChange(e.target.value)
                                }
                              >
                                {TAX_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </form.AppField>
                        </td>
                        <td className="px-2 py-1 text-right">
                          ${net.toFixed(2)}
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-center gap-1">
                            <button
                              className="text-muted hover:text-fg"
                              onClick={() => {
                                const r = field.state.value[i];
                                field.insertValue(i + 1, {
                                  ...r,
                                  description: `${r.description} (copy)`,
                                });
                              }}
                              title={t.editableTable.duplicateRow}
                            >
                              ⧉
                            </button>
                            <button
                              className="text-muted hover:text-fg"
                              disabled={i === 0}
                              onClick={() => field.moveValue(i, i - 1)}
                              title={t.editableTable.moveUp}
                            >
                              ↑
                            </button>
                            <button
                              className="text-muted hover:text-fg"
                              disabled={
                                i >= field.state.value.length - 1
                              }
                              onClick={() => field.moveValue(i, i + 1)}
                              title={t.editableTable.moveDown}
                            >
                              ↓
                            </button>
                            <button
                              className="text-destructive"
                              onClick={() => field.removeValue(i)}
                              title={t.editableTable.removeRow}
                            >
                              ×
                            </button>
                            <button
                              className="text-muted hover:text-success"
                              onClick={() => handleSaveRow(i)}
                              title="Save row"
                            >
                              ✓
                            </button>
                            {status === "saved" && (
                              <Badge variant="success" className="text-xxs">
                                Saved
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </form.AppField>
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            form.pushFieldValue("rows", { ...EMPTY_ROW })
          }
        >
          {t.editableTable.addRow}
        </Button>
      </div>

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
        <Button onClick={handleSaveAll} loading={savingAll}>
          {savingAll ? t.editableTable.saving : t.editableTable.saveAll}
        </Button>
      </div>
    </div>
  );
}

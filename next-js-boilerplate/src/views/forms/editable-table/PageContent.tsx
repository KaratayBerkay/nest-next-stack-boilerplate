"use client";

import { useCallback, useMemo, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions, useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { exceptionHandler } from "@/lib/exception-handler";
import { createTableRowFieldSchemas } from "@/validators/forms/table";
import type { ExceptionResponse } from "@/lib/api-client";
import {
  EMPTY_ROW,
  INITIAL_ROWS,
  TAX_RATES,
} from "./EditableTable-constants";
import type { InvoiceRow, RowStatus } from "./EditableTable-constants";
import { EditableTableRow } from "./EditableTableRow";
import { EditableTableTotals } from "./EditableTableTotals";
const tableFormOpts = formOptions({
  defaultValues: { rows: structuredClone(INITIAL_ROWS) },
});

export default function EditableTablePage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const [rowStatus, setRowStatus] = useState<Record<number, RowStatus>>({});
  const [savingAll, setSavingAll] = useState(false);
  const rowSchemas = useMemo(
    () => createTableRowFieldSchemas(t.editableTable),
    [t],
  );

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
    } catch (err) {
      const exc = (err as { exception?: ExceptionResponse }).exception;
      toast({
        description: exc ? exceptionHandler(exc, {}) : t.editableTable.saveFailed,
        variant: "destructive",
      });
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
            <tr className="border-border text-muted text-xxs border-b">
              <th className="px-2 py-1 text-left font-medium">
                {t.editableTable.description}
              </th>
              <th className="px-2 py-1 text-right font-medium">
                {t.editableTable.quantity}
              </th>
              <th className="px-2 py-1 text-right font-medium">
                {t.editableTable.unitPrice}
              </th>
              <th className="px-2 py-1 font-medium">
                {t.editableTable.taxClass}
              </th>
              <th className="px-2 py-1 text-right font-medium">{t.editableTable.net}</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            <form.AppField name="rows" mode="array">
              {(field) => (
                <>
                  {field.state.value.map((_: InvoiceRow, i: number) => (
                    <EditableTableRow
                      key={i}
                      form={form}
                      field={field}
                      index={i}
                      status={i in rowStatus ? rowStatus[i] : "idle"}
                      rowSchemas={rowSchemas}
                      onSaveRow={handleSaveRow}
                      t={t}
                      simulateError={simulateError}
                      toast={toast}
                      allMessages={allMessages}
                    />
                  ))}
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
          onClick={() => form.pushFieldValue("rows", { ...EMPTY_ROW })}
        >
          {t.editableTable.addRow}
        </Button>
      </div>
      <Separator />

      <EditableTableTotals totals={totals} t={t} />

      <div>
        <Button onClick={handleSaveAll} loading={savingAll}>
          {savingAll ? t.editableTable.saving : t.editableTable.saveAll}
        </Button>
      </div>
    </div>
  );
}

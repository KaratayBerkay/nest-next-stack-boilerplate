"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import { EMPTY_ROW, INITIAL_ROWS, TAX_RATES } from "./EditableTable-constants";
import type { InvoiceRow, RowStatus } from "./EditableTable-constants";
import { insertRowKey, moveRowKey, removeRowKey } from "./EditableTable-utils";
import { EditableTableRow } from "./EditableTableRow";
import { EditableTableTotals } from "./EditableTableTotals";
import { EditableTableSaveAlert } from "./EditableTableSaveAlert";
import type { EditableTableSaveResult } from "@/types/forms/EditableTableSaveAlert-types";
const tableFormOpts = formOptions({
  defaultValues: { rows: structuredClone(INITIAL_ROWS) },
});

let rowKeyCounter = 0;
function nextRowKey(): string {
  return `row-${++rowKeyCounter}`;
}

export default function EditableTablePage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});
  // Stable per-row identity so a pending "Saved" badge can't end up on the wrong row after a duplicate/move/remove.
  const [rowKeys, setRowKeys] = useState<string[]>(() =>
    INITIAL_ROWS.map(() => nextRowKey()),
  );
  const [savingAll, setSavingAll] = useState(false);
  const [saveResult, setSaveResult] = useState<EditableTableSaveResult | null>(
    null,
  );
  const saveResultIdRef = useRef(0);
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

  const handleSaveRow = useCallback((key: string) => {
    setRowStatus((prev) => ({ ...prev, [key]: "saved" }));
    setTimeout(() => {
      setRowStatus((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 2000);
  }, []);

  const handleAddRow = useCallback(() => {
    form.pushFieldValue("rows", { ...EMPTY_ROW });
    setRowKeys((prev) => [...prev, nextRowKey()]);
  }, [form]);

  const handleDuplicateRow = useCallback(
    (i: number) => {
      const row = form.state.values.rows[i] as InvoiceRow;
      void form.insertFieldValue("rows", i + 1, {
        ...row,
        description: `${row.description} ${t.editableTable.copySuffix}`,
      });
      setRowKeys((prev) => insertRowKey(prev, i + 1, nextRowKey()));
    },
    [form, t],
  );

  const handleMoveRow = useCallback(
    (from: number, to: number) => {
      form.moveFieldValues("rows", from, to);
      setRowKeys((prev) => moveRowKey(prev, from, to));
    },
    [form],
  );

  const handleRemoveRow = useCallback(
    (i: number) => {
      void form.removeFieldValue("rows", i);
      setRowKeys((prev) => removeRowKey(prev, i));
    },
    [form],
  );

  const handleSaveAll = useCallback(async () => {
    setSavingAll(true);
    try {
      await simulateError("row-rejected", { failRate: 0.5 });
      setSaveResult({
        id: ++saveResultIdRef.current,
        variant: "success",
        title: t.editableTable.saveSuccess,
      });
    } catch (err) {
      const exc = (err as { exception?: ExceptionResponse }).exception;
      setSaveResult({
        id: ++saveResultIdRef.current,
        variant: "error",
        title: t.editableTable.saveFailed,
        description: exc ? exceptionHandler(exc, allMessages) : undefined,
      });
    }
    setSavingAll(false);
  }, [simulateError, t, allMessages]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.editableTable.heading}</h2>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <EditableTableTotals totals={totals} t={t} />
        <Button onClick={handleSaveAll} loading={savingAll}>
          {savingAll ? t.editableTable.saving : t.editableTable.saveAll}
        </Button>
      </div>

      {saveResult && (
        <EditableTableSaveAlert
          key={saveResult.id}
          result={saveResult}
          onDone={() => setSaveResult(null)}
        />
      )}
      <Separator />

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
              <th className="px-2 py-1 text-right font-medium">
                {t.editableTable.net}
              </th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            <form.AppField name="rows" mode="array">
              {(field) => (
                <>
                  {field.state.value.map((_: InvoiceRow, i: number) => {
                    const rowKey = rowKeys[i];
                    return (
                      <EditableTableRow
                        key={rowKey}
                        form={form}
                        field={field}
                        index={i}
                        rowKey={rowKey}
                        status={rowStatus[rowKey] ?? "idle"}
                        rowSchemas={rowSchemas}
                        onSaveRow={handleSaveRow}
                        onDuplicateRow={handleDuplicateRow}
                        onMoveRow={handleMoveRow}
                        onRemoveRow={handleRemoveRow}
                        t={t}
                        simulateError={simulateError}
                        toast={toast}
                        allMessages={allMessages}
                      />
                    );
                  })}
                </>
              )}
            </form.AppField>
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleAddRow}>
          {t.editableTable.addRow}
        </Button>
      </div>
    </div>
  );
}

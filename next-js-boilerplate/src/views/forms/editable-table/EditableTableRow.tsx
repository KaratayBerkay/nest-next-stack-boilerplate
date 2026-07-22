/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { blurAsyncCheck } from "@/lib/forms/blur-async-check";
import { TAX_OPTIONS } from "./EditableTable-constants";
import type { InvoiceRow } from "./EditableTable-constants";
import type { EditableTableRowProps } from "@/types/forms/EditableTableRow-types";
import { EditableTableRowActions } from "./EditableTableRowActions";
export function EditableTableRow({
  form,
  field,
  index: i,
  status,
  rowSchemas,
  onSaveRow,
  t,
  simulateError,
  toast,
  allMessages,
}: EditableTableRowProps) {
  const row = field.state.value[i] as InvoiceRow;
  const net = row.quantity * row.unitPrice;

  return (
    <tr className="border-border border-b">
      <td className="px-2 py-1">
        <form.AppField
          name={`rows[${i}].description`}
          validators={{ onChange: rowSchemas.description }}
        >
          {(subField: any) => (
            <div className="flex flex-col">
              <input
                className="border-border bg-field w-32 rounded border px-1.5 py-1 text-xs"
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
              {subField.state.meta.errors.length > 0 && (
                <span className="text-destructive text-xxs">
                  {String(subField.state.meta.errors[0])}
                </span>
              )}
              {subField.state.meta.errors.length === 0 && (
                <span className="text-muted text-xxs">
                  {t.editableTable.quantityHint}
                </span>
              )}
            </div>
          )}
        </form.AppField>
      </td>
      <td className="px-2 py-1">
        <form.AppField
          name={`rows[${i}].quantity`}
          validators={{
            onChange: rowSchemas.quantity,
            onBlurAsyncDebounceMs: 300,
            onBlurAsync: async ({ value }: { value: any }) => {
              if (!value || Number(value) <= 100) return undefined;
              return blurAsyncCheck(String(value), "row-rejected", {
                simulateError, toast, allMessages,
              });
            },
          }}
        >
          {(subField: any) => (
            <div className="flex flex-col items-end">
              <input
                type="number"
                className="border-border bg-field w-16 rounded border px-1.5 py-1 text-right text-xs"
                value={subField.state.value}
                min={0}
                onChange={(e) =>
                  subField.handleChange(Math.max(0, Number(e.target.value)))
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
          {(subField: any) => (
            <div className="flex flex-col items-end">
              <input
                type="number"
                step="0.01"
                className="border-border bg-field w-20 rounded border px-1.5 py-1 text-right text-xs"
                value={subField.state.value}
                min={0}
                onChange={(e) =>
                  subField.handleChange(Math.max(0, Number(e.target.value)))
                }
              />
              {subField.state.meta.errors.length > 0 && (
                <span className="text-destructive text-xxs">
                  {String(subField.state.meta.errors[0])}
                </span>
              )}
              {subField.state.meta.errors.length === 0 && (
                <span className="text-muted text-xxs">
                  {t.editableTable.unitPriceHint}
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
          {(subField: any) => (
            <select
              className="border-border bg-field rounded border px-1.5 py-1 text-xs"
              value={subField.state.value}
              onChange={(e) => subField.handleChange(e.target.value)}
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
        <EditableTableRowActions
          field={field}
          index={i}
          status={status}
          onSaveRow={onSaveRow}
          t={t}
        />
      </td>
    </tr>
  );
}

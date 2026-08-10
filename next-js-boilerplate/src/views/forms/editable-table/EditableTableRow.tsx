/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { blurAsyncCheck } from "@/lib/forms/blur-async-check";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
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
      <td className="px-2 py-1 align-top">
        <form.AppField
          name={`rows[${i}].description`}
          validators={{ onChange: rowSchemas.description }}
        >
          {(subField: any) => (
            <div className="flex flex-col">
              <Input
                className="w-32 text-xs"
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
              <FormFieldInfo field={subField} />
            </div>
          )}
        </form.AppField>
      </td>
      <td className="px-2 py-1 align-top">
        <form.AppField
          name={`rows[${i}].quantity`}
          validators={{
            onChange: rowSchemas.quantity,
            onBlurAsyncDebounceMs: 300,
            onBlurAsync: async ({ value }: { value: any }) => {
              if (!value || Number(value) <= 100) return undefined;
              return blurAsyncCheck(String(value), "row-rejected", {
                simulateError,
                toast,
                allMessages,
              });
            },
          }}
        >
          {(subField: any) => (
            <div className="flex flex-col items-end">
              <Input
                type="number"
                className="w-20 text-right text-xs"
                value={subField.state.value}
                min={0}
                onChange={(e) =>
                  subField.handleChange(Math.max(0, Number(e.target.value)))
                }
              />
              <FormFieldInfo
                field={subField}
                hint={t.editableTable.quantityHint}
              />
            </div>
          )}
        </form.AppField>
      </td>
      <td className="px-2 py-1 align-top">
        <form.AppField
          name={`rows[${i}].unitPrice`}
          validators={{ onChange: rowSchemas.unitPrice }}
        >
          {(subField: any) => (
            <div className="flex flex-col items-end">
              <Input
                type="number"
                step="0.01"
                className="w-24 text-right text-xs"
                value={subField.state.value}
                min={0}
                onChange={(e) =>
                  subField.handleChange(Math.max(0, Number(e.target.value)))
                }
              />
              <FormFieldInfo
                field={subField}
                hint={t.editableTable.unitPriceHint}
              />
            </div>
          )}
        </form.AppField>
      </td>
      <td className="px-2 py-1 align-top">
        <form.AppField
          name={`rows[${i}].taxClass`}
          validators={{ onChange: rowSchemas.taxClass }}
        >
          {(subField: any) => (
            <Dropdown
              options={TAX_OPTIONS}
              value={subField.state.value}
              onChange={(value) => subField.handleChange(value)}
            />
          )}
        </form.AppField>
      </td>
      <td className="px-2 py-1 text-right align-top">
        <div className="flex h-9 items-center justify-end">
          ${net.toFixed(2)}
        </div>
      </td>
      <td className="px-2 py-1 align-top">
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

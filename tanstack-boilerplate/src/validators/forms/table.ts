import { z } from "zod";

const DEFAULT_TABLE_T: Record<string, string> = {
  descRequired: "Required",
  qtyMin: "Min 1",
  pricePositive: "Must be positive",
  taxClassRequired: "Select tax class",
};

export const tableRowSchema = z.object({
  description: z.string().min(1, DEFAULT_TABLE_T.descRequired),
  quantity: z.number().min(1, DEFAULT_TABLE_T.qtyMin),
  unitPrice: z.number().min(0, DEFAULT_TABLE_T.pricePositive),
  taxClass: z.string().min(1, DEFAULT_TABLE_T.taxClassRequired),
});

export const tableSchema = z.object({
  rows: z.array(tableRowSchema),
});

export function createTableRowFieldSchemas(t: Record<string, string>) {
  return {
    description: z.string().min(1, t.descRequired ?? "Required"),
    quantity: z.number().min(1, t.qtyMin ?? "Min 1"),
    unitPrice: z.number().min(0, t.pricePositive ?? "Must be positive"),
    taxClass: z.string().min(1, t.taxClassRequired ?? "Select tax class"),
  };
}

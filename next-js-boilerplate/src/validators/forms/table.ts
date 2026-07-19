import { z } from "zod";

export const tableRowSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.number().min(1, "Min 1"),
  unitPrice: z.number().min(0, "Must be positive"),
  taxClass: z.string().min(1, "Select tax class"),
});

export const tableSchema = z.object({
  rows: z.array(tableRowSchema),
});

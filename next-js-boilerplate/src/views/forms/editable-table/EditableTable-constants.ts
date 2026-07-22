export interface InvoiceRow {
  description: string;
  quantity: number;
  unitPrice: number;
  taxClass: string;
}

export const TAX_RATES: Record<string, number> = {
  standard: 0.2,
  reduced: 0.08,
  zero: 0,
};

export const TAX_OPTIONS = [
  { value: "standard", label: "Standard (20%)" },
  { value: "reduced", label: "Reduced (8%)" },
  { value: "zero", label: "Zero (0%)" },
];

export const EMPTY_ROW: InvoiceRow = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxClass: "standard",
};

export const INITIAL_ROWS: InvoiceRow[] = [
  {
    description: "Web Development",
    quantity: 1,
    unitPrice: 1500,
    taxClass: "standard",
  },
  {
    description: "UI Design",
    quantity: 2,
    unitPrice: 750,
    taxClass: "reduced",
  },
  {
    description: "Hosting (monthly)",
    quantity: 12,
    unitPrice: 25,
    taxClass: "standard",
  },
];

export type RowStatus = "idle" | "saved";

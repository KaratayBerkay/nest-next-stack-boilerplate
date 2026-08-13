"use client";

import {
  IconCheck,
  IconDeviceLaptop,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareProductsMessages } from "@/types/pages/compare-products/CompareProductsMessages-types";

type SpecValue = string | boolean;

interface ProductRow {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating: string;
  badge?: string;
}

const PRODUCTS: ProductRow[] = [
  {
    id: "probook-x",
    name: "ProBook X",
    price: "$1,299.00",
    rating: "4.9",
    badge: "compareProducts2Badge",
  },
  {
    id: "airtech",
    name: "AirTech",
    price: "$1,099.00",
    originalPrice: "$1,249.00",
    rating: "4.7",
  },
  {
    id: "vertex-14",
    name: "Vertex 14",
    price: "$949.00",
    rating: "4.5",
  },
  {
    id: "pulse-mini",
    name: "Pulse Mini",
    price: "$749.00",
    originalPrice: "$849.00",
    rating: "4.3",
  },
];

const SPEC_ROWS: { labelKey: string; values: SpecValue[] }[] = [
  {
    labelKey: "compareProducts2Row1Label",
    values: ["Intel Core Ultra 7", "Apple M3", "AMD Ryzen 7", "Intel Core i5"],
  },
  {
    labelKey: "compareProducts2Row2Label",
    values: [
      '14" 3K OLED',
      '13.6" Liquid Retina',
      '14" 2.8K IPS',
      '14" Full HD',
    ],
  },
  {
    labelKey: "compareProducts2Row3Label",
    values: ["32GB LPDDR5X", "16GB Unified", "16GB DDR5", "8GB DDR5"],
  },
  {
    labelKey: "compareProducts2Row4Label",
    values: ["18 hours", "16 hours", "12 hours", "9 hours"],
  },
  {
    labelKey: "compareProducts2Row5Label",
    values: ["1.32 kg", "1.24 kg", "1.49 kg", "1.61 kg"],
  },
  {
    labelKey: "compareProducts2Row6Label",
    values: [true, true, false, false],
  },
  {
    labelKey: "compareProducts2Row7Label",
    values: [true, true, true, false],
  },
  {
    labelKey: "compareProducts2Row8Label",
    values: ["3 years", "2 years", "2 years", "1 year"],
  },
];

function specValue(value: SpecValue) {
  if (typeof value === "boolean") {
    return value ? (
      <IconCheck size={20} className="text-success" stroke={2} />
    ) : (
      <IconX size={20} className="text-muted" stroke={2} />
    );
  }
  return value;
}

export function ProductTablePricing() {
  const m = useMessages("pages") as unknown as PagesWithCompareProductsMessages;
  const co = m.compareProducts;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compareProducts2Title}
          </h2>
          <p className="text-muted max-w-2xl text-lg">
            {co.compareProducts2Description}
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-40">
                  {co.compareProducts2ModelLabel}
                </TableHead>
                {PRODUCTS.map((product) => (
                  <TableHead
                    key={product.id}
                    className="min-w-[220px] text-center"
                  >
                    <AspectRatio ratio={4 / 3} className="mb-3">
                      <div className="bg-surface-hover ring-border flex size-full items-center justify-center overflow-hidden rounded-xl shadow-xs ring-1 ring-inset">
                        <IconDeviceLaptop
                          size={64}
                          className="text-muted"
                          stroke={1.2}
                        />
                      </div>
                    </AspectRatio>
                    <div className="flex flex-col items-center gap-1">
                      {product.badge && (
                        <Badge size="sm">{co[product.badge]}</Badge>
                      )}
                      <span className="text-base leading-tight font-semibold">
                        {product.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm">
                        <IconStar
                          size={14}
                          className="text-warning"
                          fill="currentColor"
                        />
                        {product.rating}
                      </span>
                      <span className="text-lg">
                        {product.price}
                        {product.originalPrice && (
                          <span className="text-muted ml-2 text-sm line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {SPEC_ROWS.map((row, rowIndex) => (
                <TableRow key={row.labelKey}>
                  <TableCell
                    className={
                      rowIndex % 2 === 1
                        ? "bg-surface-hover/60 font-medium"
                        : "font-medium"
                    }
                  >
                    {co[row.labelKey]}
                  </TableCell>
                  {row.values.map((value, vIndex) => (
                    <TableCell
                      key={vIndex}
                      className={
                        rowIndex % 2 === 1
                          ? "bg-surface-hover/60 text-center align-middle"
                          : "text-center align-middle"
                      }
                    >
                      <div className="flex items-center justify-center">
                        {specValue(value)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="bg-surface-hover/60 font-medium">
                  {co.compareProducts2AddLabel}
                </TableCell>
                {PRODUCTS.map((product) => (
                  <TableCell
                    key={product.id}
                    className="bg-surface-hover/60 text-center align-middle"
                  >
                    <Button size="sm" className="w-full">
                      {co.compareProducts2AddButton}
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

"use client";

import {
  IconCheck,
  IconHeadphones,
  IconStar,
  IconX,
} from "@tabler/icons-react";
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
  icon: typeof IconHeadphones;
}

const PRODUCTS: ProductRow[] = [
  {
    id: "wireless-pro",
    name: "Wireless Pro Headphones",
    price: "$299.99",
    rating: "4.8",
    icon: IconHeadphones,
  },
  {
    id: "studio-monitor",
    name: "Studio Monitor Plus",
    price: "$249.99",
    originalPrice: "$279.99",
    rating: "4.5",
    badge: "compareProducts1Badge",
    icon: IconHeadphones,
  },
  {
    id: "essential-audio",
    name: "Essential Audio",
    price: "$149.99",
    rating: "4.2",
    icon: IconHeadphones,
  },
];

const SPEC_ROWS: { labelKey: string; values: SpecValue[] }[] = [
  { labelKey: "compareProducts1Row1Label", values: ["40mm", "50mm", "40mm"] },
  {
    labelKey: "compareProducts1Row2Label",
    values: ["20Hz-20kHz", "10Hz-40kHz", "20Hz-20kHz"],
  },
  {
    labelKey: "compareProducts1Row3Label",
    values: [true, true, false],
  },
  {
    labelKey: "compareProducts1Row4Label",
    values: ["30 hours", "24 hours", "20 hours"],
  },
  { labelKey: "compareProducts1Row5Label", values: [true, true, true] },
  { labelKey: "compareProducts1Row6Label", values: ["5.3", "5.2", "5.0"] },
  {
    labelKey: "compareProducts1Row7Label",
    values: [true, false, true],
  },
  { labelKey: "compareProducts1Row8Label", values: ["250g", "280g", "220g"] },
  { labelKey: "compareProducts1Row9Label", values: [true, true, false] },
  {
    labelKey: "compareProducts1Row10Label",
    values: ["2 years", "2 years", "1 year"],
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

export function SideBySideSpecs() {
  const m = useMessages("pages") as unknown as PagesWithCompareProductsMessages;
  const co = m.compareProducts;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compareProducts1Title}
          </h2>
          <p className="text-muted max-w-2xl text-lg">
            {co.compareProducts1Description}
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead className="w-48 border-r" />
                {PRODUCTS.map((product, index) => (
                  <TableHead
                    key={product.id}
                    className={
                      index < PRODUCTS.length - 1
                        ? "min-w-[220px] border-r text-center"
                        : "min-w-[220px] text-center"
                    }
                  >
                    <div className="pb-4">
                      <div className="bg-surface-hover ring-border mx-auto flex size-44 items-center justify-center overflow-hidden rounded-xl shadow-xs ring-1 ring-inset">
                        <product.icon
                          size={72}
                          className="text-muted"
                          stroke={1.2}
                        />
                      </div>
                      <div className="-mt-2 flex h-7 items-center justify-center">
                        {product.badge && (
                          <Badge size="sm" className="mx-auto">
                            {co[product.badge]}
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-2 text-lg leading-tight font-semibold">
                        {product.name}
                      </h3>
                      <div className="flex min-h-[1.5rem] items-center justify-center gap-2">
                        <span className="text-lg">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-muted text-sm line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <IconStar
                          size={16}
                          className="text-warning"
                          fill="currentColor"
                        />
                        <span className="text-sm">{product.rating}</span>
                      </div>
                      <Button className="mt-4 w-full" size="sm">
                        {co.compareProducts1AddButton}
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {SPEC_ROWS.map((row) => (
                <TableRow key={row.labelKey}>
                  <TableCell className="border-r font-medium">
                    {co[row.labelKey]}
                  </TableCell>
                  {row.values.map((value, vIndex) => (
                    <TableCell
                      key={vIndex}
                      className="text-center align-middle"
                    >
                      <div className="flex items-center justify-center">
                        {specValue(value)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

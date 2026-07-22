import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { variants, sizes } from "./variant-gallery-data";

export function VariantCombinationTable() {
  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold">All Combinations</h3>
      <p className="text-muted mb-4 text-sm">
        Every variant and size pairing in a grid.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="text-muted px-3 py-2.5 text-left text-xs font-medium">
                Variant
              </th>
              {sizes.map((size) => (
                <th
                  key={size}
                  className="text-muted px-3 py-2.5 text-center text-xs font-medium uppercase"
                >
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr
                key={variant}
                className="border-border border-b last:border-b-0"
              >
                <td className="px-3 py-2 text-xs font-medium whitespace-nowrap capitalize">
                  {variant}
                </td>
                {sizes.map((size) => (
                  <td key={`${variant}-${size}`} className="px-3 py-2">
                    <div className="flex justify-center">
                      <Card variant={variant} className="min-w-32">
                        <CardContent
                          className={cn(
                            size === "sm"
                              ? "p-2"
                              : size === "lg"
                                ? "p-5"
                                : "p-3",
                          )}
                        >
                          <p className="text-muted text-center text-[10px]">
                            {variant} / {size}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

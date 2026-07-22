import { cn } from "@/lib/cn";
import { tiers, sections } from "./PricingTiers-data";

function CheckIcon() {
  return (
    <svg
      className="text-brand h-5 w-5 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      className="text-muted/40 h-5 w-5 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" />
    </svg>
  );
}

interface FeatureComparisonTableProps {
  selectedTier: string | null;
}

export function FeatureComparisonTable({
  selectedTier,
}: FeatureComparisonTableProps) {
  return (
    <div className="mt-16">
      <h3 className="mb-8 text-center text-xl font-bold">
        Compare features across all tiers
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="py-3.5 pr-4 text-left font-semibold" />
              {tiers.map((tier) => (
                <th
                  key={tier.name}
                  className={cn(
                    "px-4 py-3.5 text-center font-semibold",
                    selectedTier === tier.name
                      ? "text-brand"
                      : tier.popular && !selectedTier
                        ? "text-brand"
                        : "",
                  )}
                >
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <>
                <tr key={section.name}>
                  <td
                    colSpan={4}
                    className="text-muted pt-8 pb-2 text-xs font-semibold tracking-wider uppercase"
                  >
                    {section.name}
                  </td>
                </tr>
                {section.features.map((feature) => (
                  <tr key={feature.name} className="border-border border-b">
                    <td className="text-fg py-4 pr-4 font-medium">
                      {feature.name}
                    </td>
                    {feature.tiers.map((value, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-4 py-4 text-center",
                          tiers[i]?.popular && "bg-brand/5",
                        )}
                      >
                        {typeof value === "boolean" ? (
                          value ? (
                            <CheckIcon />
                          ) : (
                            <MinusIcon />
                          )
                        ) : (
                          <span className="text-fg">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

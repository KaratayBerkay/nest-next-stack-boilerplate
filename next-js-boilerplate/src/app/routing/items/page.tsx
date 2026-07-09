import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Items",
  description: "Items list",
};

const SAMPLE_IDS = ["42", "alpha", "7"];

export default function ItemsIndex() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Dynamic routes</h2>
      <p className="text-muted text-sm">
        Each link renders <code>items/[id]/page.tsx</code> with a different
        param.
      </p>
      <ul className="flex gap-3 text-sm" data-testid="item-links">
        {SAMPLE_IDS.map((id) => (
          <li key={id}>
            <Link
              className="text-brand underline"
              href={`/routing/items/${id}`}
            >
              item {id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

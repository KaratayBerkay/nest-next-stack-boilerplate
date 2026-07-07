"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const components = [
  { name: "Alert", slug: "alert" },
  { name: "Avatar", slug: "avatar" },
  { name: "Badge", slug: "badge" },
  { name: "Button", slug: "button" },
  { name: "Card", slug: "card" },
  { name: "Checkbox", slug: "checkbox" },
  { name: "Command", slug: "command" },
  { name: "Dialog", slug: "dialog" },
  { name: "Dropdown Menu", slug: "dropdown-menu" },
  { name: "Input", slug: "input" },
  { name: "Label", slug: "label" },
  { name: "Popover", slug: "popover" },
  { name: "Select", slug: "select" },
  { name: "Separator", slug: "separator" },
  { name: "Skeleton", slug: "skeleton" },
  { name: "Switch", slug: "switch" },
  { name: "Tabs", slug: "tabs" },
  { name: "Textarea", slug: "textarea" },
  { name: "Toast", slug: "toast" },
  { name: "Tooltip", slug: "tooltip" },
] as const;

export default function UIPage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold">UI Components</h2>
        <p className="text-muted text-xs">
          Browse and inspect all custom UI components.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {components.map((c) => (
          <Link
            key={c.slug}
            href={`/v1/${lang}/ui/${c.slug}`}
            className="surface flex items-center justify-center p-4 text-center text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

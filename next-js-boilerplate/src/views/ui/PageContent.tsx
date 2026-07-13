"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const components = [
  { name: "Accordion", slug: "accordion" },
  { name: "Alert", slug: "alert" },
  { name: "Alert Dialog", slug: "alert-dialog" },
  { name: "Aspect Ratio", slug: "aspect-ratio" },
  { name: "Avatar", slug: "avatar" },
  { name: "Badge", slug: "badge" },
  { name: "Breadcrumb", slug: "breadcrumb" },
  { name: "Button", slug: "button" },
  { name: "Calendar", slug: "calendar" },
  { name: "Card", slug: "card" },
  { name: "Carousel", slug: "carousel" },
  { name: "Checkbox", slug: "checkbox" },
  { name: "Collapsible", slug: "collapsible" },
  { name: "Combobox", slug: "combobox" },
  { name: "Command", slug: "command" },
  { name: "Context Menu", slug: "context-menu" },
  { name: "Date Picker", slug: "date-picker" },
  { name: "Dialog", slug: "dialog" },
  { name: "Drawer", slug: "drawer" },
  { name: "Dropdown Menu", slug: "dropdown-menu" },
  { name: "Empty", slug: "empty" },
  { name: "Hover Card", slug: "hover-card" },
  { name: "Input", slug: "input" },
  { name: "Input Group", slug: "input-group" },
  { name: "Input OTP", slug: "input-otp" },
  { name: "Kbd", slug: "kbd" },
  { name: "Label", slug: "label" },
  { name: "Menubar", slug: "menubar" },
  { name: "Native Select", slug: "native-select" },
  { name: "Navigation Menu", slug: "navigation-menu" },
  { name: "Pagination", slug: "pagination" },
  { name: "Popover", slug: "popover" },
  { name: "Progress", slug: "progress" },
  { name: "Radio Group", slug: "radio-group" },
  { name: "Resizable", slug: "resizable" },
  { name: "Scroll Area", slug: "scroll-area" },
  { name: "Select", slug: "select" },
  { name: "Separator", slug: "separator" },
  { name: "Sheet", slug: "sheet" },
  { name: "Skeleton", slug: "skeleton" },
  { name: "Slider", slug: "slider" },
  { name: "Spinner", slug: "spinner" },
  { name: "Switch", slug: "switch" },
  { name: "Table", slug: "table" },
  { name: "Tabs", slug: "tabs" },
  { name: "Textarea", slug: "textarea" },
  { name: "Time Input", slug: "time-input" },
  { name: "Toast", slug: "toast" },
  { name: "Toggle", slug: "toggle" },
  { name: "Toggle Group", slug: "toggle-group" },
  { name: "Tooltip", slug: "tooltip" },
  { name: "Typography", slug: "typography" },
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

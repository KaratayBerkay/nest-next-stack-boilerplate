"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { EditorMenusTab } from "./EditorMenusTab";
import { ShortcutLabelsTab } from "./ShortcutLabelsTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Editor Menus",
    description: "File, Edit, and View menus with separators.",
    render: () => <EditorMenusTab />,
  },
  {
    id: "variants",
    title: "Shortcut Labels",
    description: "Menu items with keyboard shortcut sequences.",
    render: () => <ShortcutLabelsTab />,
  },
];

export default function MenubarPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Menubar"
      intro="A horizontal menu bar."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

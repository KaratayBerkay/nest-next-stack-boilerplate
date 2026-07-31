"use client";
import { useState } from "react";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

function EmojiInsertExample() {
  const [value, setValue] = useState("Try the emoji button");
  return (
    <div className="flex items-center gap-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
      />
      <EmojiPickerButton
        label="Insert emoji"
        onEmojiSelect={(emoji) => setValue((prev) => prev + emoji)}
      />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Basic",
    description: "A button that opens an emoji picker popover.",
    render: () => (
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <EmojiPickerButton
          label="Pick emoji"
          onEmojiSelect={(emoji) => {
            window.alert(`Selected: ${emoji}`);
          }}
        />
      </section>
    ),
  },
  {
    id: "variants",
    title: "Insert into input",
    description: "Insert the selected emoji into a text field.",
    render: () => (
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Composer-style usage</h3>
        <EmojiInsertExample />
      </section>
    ),
  },
];

export default function EmojiPickerPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Emoji Picker"
      intro="A popover emoji picker for chat composers."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

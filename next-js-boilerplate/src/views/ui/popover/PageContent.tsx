"use client";

import { useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function InlineFormTab() {
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open form</Button>
      </PopoverTrigger>
      <PopoverContent title="Edit" initialFocus={inputRef}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <input id="name" ref={inputRef} placeholder="Enter name" className="border-border bg-bg rounded-md border px-3 py-2 text-sm focus-visible:ring-brand focus-visible:border-brand focus-visible:ring-2 focus-visible:outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <input id="email" type="email" placeholder="Enter email" className="border-border bg-bg rounded-md border px-3 py-2 text-sm focus-visible:ring-brand focus-visible:border-brand focus-visible:ring-2 focus-visible:outline-none" />
          </div>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function WithTitleTab() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open help</Button>
      </PopoverTrigger>
      <PopoverContent title="Help">
        <div className="flex flex-col gap-3">
          <p className="text-muted text-sm">
            This popover uses the title prop to show a header on mobile.
          </p>
          <p className="text-muted text-sm">
            Resize the viewport to see the title bar appear at the top.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const examples: UIExample[] = [
  {
    id: "inline-form",
    title: "Inline Form",
    description: "Popover with a simple form and initialFocus on the first input.",
    render: () => <InlineFormTab />,
  },
  {
    id: "with-title",
    title: "With Title",
    description: "Popover with the title prop displayed as a mobile sheet header.",
    render: () => <WithTitleTab />,
  },
];

export default function Page({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Popover"
      intro="A popover that displays content anchored to a trigger element. On mobile it renders as a bottom sheet."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

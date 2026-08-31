"use client";

import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Default",
    description: "A default label and one with a required indicator.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Label data-testid="label-default">Email</Label>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">With Required Indicator</h3>
          <Label required data-testid="label-required">
            Full Name
          </Label>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Paired Controls",
    description: "Labels connected to inputs via htmlFor in a signup form.",
    render: () => (
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Signup Form</h3>
        <div className="flex max-w-sm flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-email" required>
              Email
            </Label>
            <Input
              id="example-email"
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-password" required>
              Password
            </Label>
            <Input
              id="example-password"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-bio">Bio</Label>
            <Input id="example-bio" placeholder="Tell us about yourself..." />
          </div>
        </div>
      </section>
    ),
  },
];

export default function LabelPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Label"
      intro="A form label with optional required indicator."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

"use client";

import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Paired Controls",
    description: "Label with htmlFor connecting to input, switch, and checkbox.",
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
    id: "examples",
    title: "Required Marker",
    description: "Label with required indicator and disabled dimming.",
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
            <Input
              id="example-bio"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </section>
    ),
  },
];

export default function LabelPage() {
  return (
    <ExampleTabs
      title="Label"
      intro="A form label with optional required indicator."
      examples={examples}
    />
  );
}

"use client";

import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

export default function LabelPage() {
  return (
    <div className="flex flex-col gap-4" data-testid="label-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Label</h2>
        <p className="text-muted text-sm">
          A form label with optional required indicator.
        </p>
      </div>

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

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Usage Example</h3>
        <div className="flex max-w-sm flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-email" required>
              Email
            </Label>
            <Input id="example-email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-password" required>
              Password
            </Label>
            <Input id="example-password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-bio">Bio</Label>
            <Input id="example-bio" placeholder="Tell us about yourself..." />
          </div>
        </div>
      </section>
    </div>
  );
}

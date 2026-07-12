"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Input,
  DateInput,
  DateTimeInput,
  InputWithIcon,
  FileInput,
} from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

export default function InputDemo() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateTime, setDateTime] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Input</h2>
        <p className="text-muted text-sm">
          A text input field for user data entry.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Default</h3>
              <Input data-testid="input-default" className="max-w-sm" />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">With Placeholder</h3>
              <Input
                placeholder="Enter your email"
                data-testid="input-placeholder"
                className="max-w-sm"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Disabled</h3>
              <Input
                disabled
                placeholder="Disabled input"
                data-testid="input-disabled"
                className="max-w-sm"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Error State</h3>
              <Input
                error="This field is required"
                defaultValue="Invalid value"
                data-testid="input-error"
                className="max-w-sm"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">With Icon</h3>
              <InputWithIcon
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
                placeholder="Search..."
                className="max-w-sm"
                data-testid="input-with-icon"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Date Input</h3>
              <div className="flex max-w-sm flex-col gap-2">
                <DateInput
                  value={date}
                  onChange={setDate}
                  data-testid="date-input"
                />
                {date && (
                  <p className="text-muted text-xs">
                    Selected: {date.toLocaleDateString()}
                  </p>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Date & Time Input</h3>
              <div className="flex max-w-sm flex-col gap-2">
                <DateTimeInput
                  value={dateTime}
                  onChange={setDateTime}
                  data-testid="date-time-input"
                />
                {dateTime && (
                  <p className="text-muted text-xs">
                    Selected: {dateTime.toLocaleString()}
                  </p>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">File Input</h3>
              <FileInput data-testid="file-input" />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Login Form</h3>
            <div className="surface max-w-sm space-y-4 p-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-muted flex items-center gap-2 text-xs">
                  <input type="checkbox" className="rounded" /> Remember me
                </label>
                <Button size="sm" variant="primary">
                  Sign In
                </Button>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

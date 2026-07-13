"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Input,
  DateInput,
  DateTimeInput,
  FileInput,
} from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

const SearchIcon = (
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
);

const MailIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function InputDemo() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateTime, setDateTime] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Input</h2>
        <p className="text-muted text-sm">
          A text input field for user data entry.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Login Email</TabsTrigger>
          <TabsTrigger value="examples">Search Field</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Default</h3>
              <Input data-testid="input-default" className="max-w-sm" />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">With Left & Right Icons</h3>
              <Input
                leftIcon={SearchIcon}
                rightIcon={MailIcon}
                placeholder="Search or email..."
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
              <h3 className="text-lg font-semibold">Disabled</h3>
              <Input
                disabled
                placeholder="Disabled input"
                data-testid="input-disabled"
                className="max-w-sm"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Sizes</h3>
              <div className="flex flex-col gap-3 max-w-sm">
                <Input
                  placeholder="Small"
                  className="h-8 text-xs px-2 py-1.5"
                />
                <Input placeholder="Medium (default)" />
                <Input
                  placeholder="Large"
                  className="h-10 text-base px-4 py-2"
                />
              </div>
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
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Search Bar</h3>
              <div className="max-w-sm">
                <Input
                  leftIcon={SearchIcon}
                  placeholder="Search documentation..."
                />
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Login Form</h3>
              <div className="max-w-sm space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={MailIcon}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={LockIcon}
                  />
                </div>
                <Button className="w-full">Sign In</Button>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Registration Form</h3>
              <div className="max-w-sm space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input id="reg-name" placeholder="John Doe" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Button className="w-full">Create Account</Button>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Login Form (Default)</h3>
              <div className="surface max-w-sm space-y-4 p-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="default-email">Email</Label>
                  <Input
                    id="default-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="default-password">Password</Label>
                  <Input
                    id="default-password"
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export function SelectDemo() {
  const [fruit, setFruit] = useState("apple");
  const [color, setColor] = useState<string | undefined>(undefined);
  const [country, setCountry] = useState("us");

  return (
    <div className="flex flex-col gap-4" data-testid="select-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Select</h2>
        <p className="text-muted text-sm">
          A custom select component with dropdown items.
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
              <h3 className="text-lg font-semibold">With Default Value</h3>
              <p className="text-muted mb-2 text-xs">Selected: {fruit}</p>
              <Select value={fruit} onValueChange={setFruit}>
                <SelectTrigger className="w-48" data-testid="select-trigger-default">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent data-testid="select-content-default">
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="cherry">Cherry</SelectItem>
                  <SelectItem value="dragonfruit">Dragonfruit</SelectItem>
                </SelectContent>
              </Select>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">With Placeholder</h3>
              <p className="text-muted mb-2 text-xs">Selected: {color ?? "none"}</p>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="w-48" data-testid="select-trigger-placeholder">
                  <SelectValue placeholder="Pick a color" />
                </SelectTrigger>
                <SelectContent data-testid="select-content-placeholder">
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                </SelectContent>
              </Select>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Country Selector</h3>
            <div className="surface max-w-sm space-y-3 p-4">
              <p className="text-sm font-medium">Shipping Address</p>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="jp">Japan</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted text-xs">
                Selected country code: {country.toUpperCase()}
              </p>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

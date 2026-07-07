"use client";

import { useState } from "react";
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

  return (
    <div className="flex flex-col gap-4" data-testid="select-demo">
      <h2 className="text-xl font-bold">Select</h2>
      <p className="text-muted text-sm">
        A custom select component with dropdown items.
      </p>

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
          <SelectTrigger
            className="w-48"
            data-testid="select-trigger-placeholder"
          >
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
  );
}

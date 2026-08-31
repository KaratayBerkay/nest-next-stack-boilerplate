"use client";

import { useState } from "react";
import { CheckboxChip } from "@/components/ui/Checkbox";

export function InterestChipsTab() {
  const [interests, setInterests] = useState<string[]>(["design", "coding"]);

  const allChips = [
    { value: "design", label: "Design", count: 12 },
    { value: "coding", label: "Coding", count: 24 },
    { value: "marketing", label: "Marketing", count: 8 },
    { value: "photography", label: "Photography", count: 5 },
  ];

  function toggleChip(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">Filter chips — toggle interests.</p>
      <div className="flex flex-wrap gap-2">
        {allChips.map((chip) => (
          <CheckboxChip
            key={chip.value}
            label={chip.label}
            count={chip.count}
            checked={interests.includes(chip.value)}
            onChange={() => toggleChip(chip.value)}
            onRemove={
              interests.includes(chip.value)
                ? () => toggleChip(chip.value)
                : undefined
            }
          />
        ))}
      </div>
      <p className="text-fg text-sm">
        Selected: {interests.join(", ") || "none"}
      </p>
    </div>
  );
}

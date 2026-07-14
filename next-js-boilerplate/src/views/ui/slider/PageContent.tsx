"use client";
import { useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ComponentsTab() {
  const [volume, setVolume] = useState([50]);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="max-w-sm"
        />
        <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
          <span className="text-sm">
            Value: <strong>{volume[0]}</strong>
          </span>
          <button
            type="button"
            onClick={() => setVolume([50])}
            className="text-muted hover:text-fg p-0.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}

function ExamplesTab() {
  const [price, setPrice] = useState([25]);
  const [brightness, setBrightness] = useState([75]);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Price Range</h3>
        <Slider
          value={price}
          onValueChange={setPrice}
          max={100}
          step={5}
          className="max-w-sm"
        />
        <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
          <span className="text-sm">
            Max price: <strong>${price[0]}</strong>
          </span>
          <button
            type="button"
            onClick={() => setPrice([25])}
            className="text-muted hover:text-fg p-0.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Brightness</h3>
        <Slider
          value={brightness}
          onValueChange={setBrightness}
          max={100}
          step={10}
          className="max-w-sm"
        />
        <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
          <span className="text-sm">
            Brightness: <strong>{brightness[0]}%</strong>
          </span>
          <button
            type="button"
            onClick={() => setBrightness([75])}
            className="text-muted hover:text-fg p-0.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Price Range",
    description: "Two-thumb range slider with value readout.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Volume",
    description: "Single thumb slider with icon and live percentage.",
    render: () => <ExamplesTab />,
  },
];

export default function SliderPage() {
  return (
    <ExampleTabs
      title="Slider"
      intro="A range slider component."
      examples={examples}
    />
  );
}

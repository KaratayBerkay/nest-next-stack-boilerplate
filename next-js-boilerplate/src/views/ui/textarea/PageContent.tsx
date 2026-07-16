"use client";

import { useState } from "react";
import { Textarea, AutoResizeTextarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { TextareaVariant } from "@/types/ui/Textarea-types";

function ExamplesTab() {
  const [comment, setComment] = useState("");

  return (
    <>
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Comment Form</h3>
        <div className="surface max-w-md space-y-3 p-4">
          <AutoResizeTextarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">
              {comment.length} characters
            </span>
            <Button size="sm" variant="primary" disabled={!comment.trim()}>
              Post Comment
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Contact Form</h3>
        <div className="surface max-w-md p-6 rounded-xl space-y-3">
          <input
            type="text"
            placeholder="Your name"
            className="w-full rounded border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          />
          <input
            type="email"
            placeholder="Your email"
            className="w-full rounded border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          />
          <Textarea placeholder="Your message..." />
          <Button size="sm" variant="primary">Send Message</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Feedback Form</h3>
        <div className="surface max-w-md p-6 rounded-xl space-y-3 border">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Feedback</h4>
          <input
            type="text"
            placeholder="Subject"
            className="w-full rounded border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          />
          <Textarea placeholder="Tell us what you think..." />
          <div className="flex justify-end">
            <Button size="sm" variant="primary">Submit</Button>
          </div>
        </div>
      </section>
    </>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Support Ticket",
    description: "Textarea with error state and helper description.",
    render: () => (
      <>
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Default</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea data-testid="textarea-default" placeholder="Default textarea..." />
            <Textarea placeholder="Enter your message..." data-testid="textarea-placeholder" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Disabled</h3>
          <Textarea disabled value="This textarea is disabled" aria-label="Disabled example" data-testid="textarea-disabled" />
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">With Error</h3>
          <Textarea error="This field is required" aria-label="Error example" data-testid="textarea-error" />
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Auto-Resize</h3>
          <AutoResizeTextarea placeholder="Type here and it will grow..." data-testid="textarea-auto-resize" />
        </section>
      </>
    ),
  },
  {
    id: "variants",
    title: "Auto-resize Reply",
    description: "Textarea that grows with content up to a max height.",
    render: () => <ExamplesTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => <Textarea variant={variant as TextareaVariant} placeholder="Textarea..." />}
      />
    ),
  },
];

export default function TextareaPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Textarea"
      intro="A multi-line text input field with multiple stylish variants."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

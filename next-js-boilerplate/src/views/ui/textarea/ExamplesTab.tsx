"use client";

import { useState } from "react";
import { Textarea, AutoResizeTextarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ExamplesTab() {
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
        <div className="surface max-w-md space-y-3 rounded-xl p-6">
          <input
            type="text"
            placeholder="Your name"
            className="border-border placeholder:text-muted focus-visible:ring-primary w-full rounded border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
          <input
            type="email"
            placeholder="Your email"
            className="border-border placeholder:text-muted focus-visible:ring-primary w-full rounded border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
          <Textarea placeholder="Your message..." />
          <Button size="sm" variant="primary">
            Send Message
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Feedback Form</h3>
        <div className="surface max-w-md space-y-3 rounded-xl border p-6">
          <h4 className="text-sm font-semibold tracking-wider uppercase">
            Feedback
          </h4>
          <input
            type="text"
            placeholder="Subject"
            className="border-border placeholder:text-muted focus-visible:ring-primary w-full rounded border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
          <Textarea placeholder="Tell us what you think..." />
          <div className="flex justify-end">
            <Button size="sm" variant="primary">
              Submit
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

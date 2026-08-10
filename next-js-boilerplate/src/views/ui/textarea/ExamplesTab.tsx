"use client";

import { useState } from "react";
import { Textarea, AutoResizeTextarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
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
          <Input type="text" placeholder="Your name" />
          <Input type="email" placeholder="Your email" />
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
          <Input type="text" placeholder="Subject" />
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

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Textarea, AutoResizeTextarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function TextareaPage() {
  const [comment, setComment] = useState("");

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="textarea-demo">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Textarea</h2>
        <p className="text-muted text-sm">
          A multi-line text input field with multiple stylish variants.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Default</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea data-testid="textarea-default" placeholder="Default textarea..." />
              <Textarea placeholder="Enter your message..." data-testid="textarea-placeholder" />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Disabled</h3>
            <Textarea disabled value="This textarea is disabled" data-testid="textarea-disabled" />
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">With Error</h3>
            <Textarea error="This field is required" data-testid="textarea-error" />
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Auto-Resize</h3>
            <AutoResizeTextarea placeholder="Type here and it will grow..." data-testid="textarea-auto-resize" />
          </section>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Textarea, AutoResizeTextarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function TextareaPage() {
  const [comment, setComment] = useState("");

  return (
    <div className="flex flex-col gap-4" data-testid="textarea-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Textarea</h2>
        <p className="text-muted text-sm">A multi-line text input field.</p>
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
              <Textarea data-testid="textarea-default" />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">With Placeholder</h3>
              <Textarea
                placeholder="Enter your message..."
                data-testid="textarea-placeholder"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Disabled</h3>
              <Textarea
                disabled
                value="This textarea is disabled"
                data-testid="textarea-disabled"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">With Error</h3>
              <Textarea
                error="This field is required"
                data-testid="textarea-error"
              />
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Auto-Resize</h3>
              <AutoResizeTextarea
                placeholder="Type here and it will grow..."
                data-testid="textarea-auto-resize"
              />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

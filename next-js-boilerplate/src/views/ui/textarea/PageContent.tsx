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

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Shiny Variant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea variant="shiny" placeholder="Shiny textarea..." />
              <AutoResizeTextarea className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 text-white placeholder:text-slate-500" placeholder="Shiny auto-resize textarea..." />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Glass Variant</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea variant="glass" placeholder="Glass textarea..." />
                <AutoResizeTextarea className="bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-slate-400" placeholder="Glass auto-resize textarea..." />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Neon Variant</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea variant="neon" placeholder="Neon textarea..." />
                <AutoResizeTextarea className="bg-slate-950/90 border-cyan-500/30 text-cyan-400 placeholder:text-slate-600 shadow-[0_0_15px_rgba(6,182,212,0.1)]" placeholder="Neon auto-resize textarea..." />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Gradient Variant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea variant="gradient" placeholder="Gradient textarea..." />
              <AutoResizeTextarea className="bg-gradient-to-br from-slate-900 to-slate-950 border-transparent text-white placeholder:text-slate-600" placeholder="Gradient auto-resize textarea..." />
            </div>
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
            <h3 className="text-lg font-semibold">Contact Form (Shiny)</h3>
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded border border-slate-700 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded border border-slate-700 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              />
              <Textarea variant="shiny" placeholder="Your message..." />
              <Button size="sm" variant="primary">Send Message</Button>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Dark Mode Form (Neon)</h3>
            <div className="bg-slate-950 p-6 rounded-xl space-y-3 border border-cyan-500/20">
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Feedback</h4>
              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded border border-cyan-500/30 bg-slate-950/90 px-3 py-2 text-sm text-cyan-400 placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              />
              <Textarea variant="neon" placeholder="Tell us what you think..." />
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

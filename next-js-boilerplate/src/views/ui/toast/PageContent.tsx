"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ToastProvider, ToastViewport, useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function VariantPreview({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className: string;
}) {
  return (
    <div
      className={`group pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-xl transition-all ${className}`}
    >
      <div className="flex-1 space-y-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs opacity-80">{description}</div>
      </div>
    </div>
  );
}

function DemoControls() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            data-testid="toast-default-btn"
            onClick={() =>
              toast({
                title: "Default Toast",
                description: "This is a default toast notification.",
              })
            }
          >
            Show Default Toast
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Success</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            data-testid="toast-success-btn"
            onClick={() =>
              toast({
                title: "Success",
                description: "Operation completed successfully.",
                variant: "success",
              })
            }
          >
            Show Success Toast
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Error / Destructive</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="destructive"
            data-testid="toast-destructive-btn"
            onClick={() =>
              toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
              })
            }
          >
            Show Destructive Toast
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Shiny</h3>
        <VariantPreview
          title="Shiny Toast"
          description="Gradient background with enhanced shadow effects."
          className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Glass</h3>
        <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
          <VariantPreview
            title="Glass Toast"
            description="Frosted glass effect with translucent background."
            className="bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Neon</h3>
        <div className="rounded-xl bg-slate-950 p-4">
          <VariantPreview
            title="Neon Toast"
            description="Glowing cyan accents on dark background."
            className="bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Gradient</h3>
        <VariantPreview
          title="Gradient Toast"
          description="Deep gradient with transparent text clipping."
          className="bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl"
        />
      </section>
    </div>
  );
}

function handleSubscribe(
  email: string,
  setEmail: Dispatch<SetStateAction<string>>,
  toast: (opts: {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
  }) => void,
) {
  if (!email.trim()) {
    toast({
      title: "Error",
      description: "Please enter your email address.",
      variant: "destructive",
    });
    return;
  }
  toast({
    title: "Subscribed!",
    description: "You have been added to our newsletter.",
    variant: "success",
  });
  setEmail("");
}

function ExampleControls() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Form Submission</h3>
        <p className="text-muted text-xs">
          Toasts triggered on form validation and submission.
        </p>
        <div className="surface max-w-sm space-y-3 p-4">
          <p className="text-sm font-medium">Newsletter Signup</p>
          <div className="flex gap-2">
            <Input
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleSubscribe(email, setEmail, toast)}
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Notification System</h3>
        <p className="text-muted text-xs">
          Different toast types for various notification scenarios.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "New message from Sarah",
                description: "Hey! Just wanted to check in on the project.",
              })
            }
          >
            New Message
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Task completed",
                description: "Your report has been generated successfully.",
                variant: "success",
              })
            }
          >
            Task Complete
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast({
                title: "Connection lost",
                description: "Unable to reach the server. Retrying...",
                variant: "destructive",
              })
            }
          >
            Connection Error
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "System update",
                description: "Version 3.1 is now available for download.",
              })
            }
          >
            System Update
          </Button>
        </div>
      </section>
    </div>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-6 w-full" data-testid="toast-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Toast</h2>
        <p className="text-muted text-sm">
          A notification toast with different variants.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <ToastProvider>
            <DemoControls />
            <ToastViewport />
          </ToastProvider>
        </TabsContent>

        <TabsContent value="examples">
          <ToastProvider>
            <ExampleControls />
            <ToastViewport />
          </ToastProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Page() {
  return <Content />;
}

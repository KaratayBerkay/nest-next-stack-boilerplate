"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ToastProvider, ToastViewport, useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

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

const examples: UIExample[] = [
  {
    id: "components",
    title: "Variant Basics",
    description: "One button per toast variant: default, destructive, success.",
    render: () => (
      <ToastProvider>
        <DemoControls />
        <ToastViewport />
      </ToastProvider>
    ),
  },
  {
    id: "examples",
    title: "Undoable Action",
    description: "Toast with an action slot for undo.",
    render: () => (
      <ToastProvider>
        <ExampleControls />
        <ToastViewport />
      </ToastProvider>
    ),
  },
];

export default function Page() {
  return (
    <div data-testid="toast-demo">
      <ExampleTabs
        title="Toast"
        intro="A notification toast with different variants."
        examples={examples}
      />
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import {
  ToastProvider,
  ToastViewport,
  useToast,
} from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function DemoControls() {
  const { toast } = useToast();

  return (
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
  );
}

function ExampleControls() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
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
  };

  return (
    <div className="surface max-w-sm space-y-3 p-4">
      <p className="text-sm font-medium">Newsletter Signup</p>
      <div className="flex gap-2">
        <Input
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button variant="primary" onClick={handleSubscribe}>
          Subscribe
        </Button>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-4" data-testid="toast-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Toast</h2>
        <p className="text-muted text-sm">
          A notification toast with different variants.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
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
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <Content />
    </Suspense>
  );
}

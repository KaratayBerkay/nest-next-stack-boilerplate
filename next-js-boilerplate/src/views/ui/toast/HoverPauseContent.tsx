"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function handleSubscribe(
  email: string,
  setEmail: Dispatch<SetStateAction<string>>,
  toast: (opts: {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
    duration?: number;
  }) => void,
) {
  if (!email.trim()) {
    toast({
      title: "Error",
      description: "Please enter your email address.",
      variant: "destructive",
      duration: 4000,
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

export function HoverPauseContent() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-xs">
        Hover a toast to pause its auto-dismiss timer.
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
    </div>
  );
}

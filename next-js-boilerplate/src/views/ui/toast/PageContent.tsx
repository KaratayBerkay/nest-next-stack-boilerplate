"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

interface NotificationItem {
  id: string;
  initials: string;
  title: string;
  time: string;
  unread: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  { id: "1", initials: "A", title: "Alex commented on your post", time: "2m ago", unread: true },
  { id: "2", initials: "S", title: "Sarah accepted your invitation", time: "1h ago", unread: true },
  { id: "3", initials: "S", title: "System update completed", time: "3h ago", unread: false },
  { id: "4", initials: "N", title: "New team member joined", time: "yesterday", unread: false },
  { id: "5", initials: "P", title: "Payment received", time: "2 days ago", unread: false },
];

function handleNotificationClick(
  notification: NotificationItem,
  toast: (opts: {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
    duration?: number;
  }) => void,
) {
  toast({
    title: notification.title,
    description: `${notification.time}`,
    variant: notification.unread ? "default" : "success",
    duration: 4000,
  });
}

function handleMarkAllRead(
  toast: (opts: {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
  }) => void,
) {
  toast({
    title: "Marked all as read",
    description: "All notifications have been marked as read.",
    variant: "success",
  });
}

function VariantBasicsContent() {
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
        Show Default
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
        Show Success
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
        Show Destructive
      </Button>
    </div>
  );
}

function UndoableActionContent() {
  const { toast } = useToast();
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-xs">
        Deleted items: {count}. Click undo to restore.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setCount((c) => c + 1);
            toast({
              title: "Item deleted",
              description: "The item has been moved to trash.",
              action: (
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs font-medium"
                  onClick={() => setCount((c) => Math.max(0, c - 1))}
                >
                  Undo
                </Button>
              ),
            });
          }}
        >
          Delete Item
        </Button>
      </div>
    </div>
  );
}

function StickyErrorContent() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            title: "Connection lost",
            description:
              "Unable to reach the server. This toast will not auto-dismiss.",
            variant: "destructive",
          })
        }
      >
        Trigger Sticky Error
      </Button>
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

function HoverPauseContent() {
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

function NotificationCenterContent() {
  const { toast } = useToast();
  const [items] = useState(NOTIFICATIONS);

  return (
    <div className="mx-auto max-w-md space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notifications ({items.length})</h3>
        <button
          className="text-brand text-sm hover:underline"
          onClick={() => handleMarkAllRead(toast)}
        >
          Mark all read
        </button>
      </div>
      <Separator />
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface/50"
            onClick={() => handleNotificationClick(item, toast)}
          >
            <Avatar size="sm" fallback={item.initials} variant={item.unread ? "brand" : "default"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-muted text-xs">{item.time}</p>
            </div>
            {item.unread && <Badge variant="default" className="shrink-0">New</Badge>}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToastGalleryContent() {
  return (
    <VariantGallery
      variants={["default", "success", "destructive"]}
      sizes={["md"]}
      render={(variant, _size) => (
        <Button variant={variant === "default" ? "outline" : variant as "primary" | "destructive"} size="sm">
          {variant}
        </Button>
      )}
    />
  );
}

const examples: UIExample[] = [
  {
    id: "toast-examples",
    title: "Toast Examples",
    description: "Basic toast variants, undo actions, sticky errors, and hover pause.",
    render: () => (
      <div className="flex flex-col gap-8">
        <VariantBasicsContent />
        <UndoableActionContent />
        <StickyErrorContent />
        <HoverPauseContent />
      </div>
    ),
  },
  {
    id: "notification-center",
    title: "Notification Center",
    description: "Inbox-style notification list with avatars, timestamps, and unread badges.",
    render: () => <NotificationCenterContent />,
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Toast variants displayed across theme variants.",
    render: () => <ToastGalleryContent />,
  },
];

export default function Page() {
  return (
    <div data-testid="toast-demo">
      <ExampleTabs
        title="Toast"
        intro="A notification toast with different variants and auto-dismiss."
        examples={examples}
      />
    </div>
  );
}

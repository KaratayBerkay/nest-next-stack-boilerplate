"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function CardPage() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(42);

  const handleLike = () => {
    setLiked((p) => !p);
    setCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Card</h2>
      <p className="text-muted text-sm">
        A container component with header, content, and footer sections.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Card data-testid="card-default" className="max-w-sm">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Deploy your new project in one click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              euismod, nisl eget aliquam ultricies.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <span className="text-muted text-xs">Cancel</span>
            <span className="text-brand text-xs font-medium">Deploy</span>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Usage Example</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="max-w-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Tailwind CSS</CardTitle>
                  <CardDescription>A utility-first CSS framework</CardDescription>
                </div>
                <Badge variant="success">Stable</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted text-sm">
                Rapidly build modern websites without ever leaving your HTML.
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <span className="text-muted text-xs">{count} likes</span>
              <Button
                size="sm"
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-1"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
                {liked ? "Liked" : "Like"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}

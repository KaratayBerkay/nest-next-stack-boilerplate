import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function handleLike(
  liked: boolean,
  setLiked: React.Dispatch<React.SetStateAction<boolean>>,
  setCount: React.Dispatch<React.SetStateAction<number>>,
) {
  setLiked((p) => !p);
  setCount((c) => (liked ? c - 1 : c + 1));
}

export function ProfileCardTab() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(42);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Profile Card</h3>
        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-muted size-12 rounded-full" />
              <div>
                <CardTitle>Sarah Johnson</CardTitle>
                <CardDescription>Frontend Developer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Passionate about building beautiful user interfaces and design
              systems.
            </p>
            <div className="mt-4 flex gap-2">
              <Badge>React</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button size="sm" variant="outline">
              Message
            </Button>
            <Button size="sm">Follow</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Project Card with Like</h3>
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
              onClick={() => handleLike(liked, setLiked, setCount)}
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
      </section>
    </div>
  );
}

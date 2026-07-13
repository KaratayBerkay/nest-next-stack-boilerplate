"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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

function handleLike(
  liked: boolean,
  setLiked: Dispatch<SetStateAction<boolean>>,
  setCount: Dispatch<SetStateAction<number>>,
) {
  setLiked((p) => !p);
  setCount((c) => (liked ? c - 1 : c + 1));
}

export default function CardPage() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(42);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Card</h2>
        <p className="text-muted text-sm">
          A container component with header, content, and footer sections.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="flex flex-col gap-6">
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam euismod, nisl eget aliquam ultricies.
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <span className="text-muted text-xs">Cancel</span>
                  <span className="text-brand text-xs font-medium">Deploy</span>
                </CardFooter>
              </Card>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Elevated</h3>
              <Card variant="elevated" className="max-w-sm">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>
                    Enhanced shadow for emphasis and depth.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted text-sm">
                    This card uses the elevated variant with a stronger shadow.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Interactive</h3>
              <Card variant="interactive" className="max-w-sm">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>
                    Hover over this card to see the effect.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted text-sm">
                    This card responds to hover with a shadow and border change.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Outline</h3>
              <Card variant="outline" className="max-w-sm">
                <CardHeader>
                  <CardTitle>Outline Card</CardTitle>
                  <CardDescription>
                    A border-only card with transparent background.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted text-sm">
                    Minimalist design with just a border.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Surface</h3>
              <Card variant="surface" className="max-w-sm">
                <CardHeader>
                  <CardTitle>Surface Card</CardTitle>
                  <CardDescription>
                    Uses the surface background styling.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted text-sm">
                    Blends with the surface background color.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Shiny</h3>
              <div className="bg-slate-950 p-6 rounded-xl">
                <Card variant="shiny" className="max-w-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Shiny Card</CardTitle>
                    <CardDescription className="text-slate-400">
                      A polished, reflective dark card variant.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Features a subtle light reflection effect for a premium look.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="bg-slate-950 p-6 rounded-xl">
                <Card variant="glass" className="max-w-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Glass Card</CardTitle>
                    <CardDescription className="text-slate-300">
                      A frosted glass effect with transparency.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Semi-transparent background with backdrop blur.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="bg-slate-950 p-6 rounded-xl">
                <Card variant="neon" className="max-w-sm">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">Neon Card</CardTitle>
                    <CardDescription className="text-cyan-300">
                      A glowing neon-accented card variant.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-cyan-200 text-sm">
                      Cyan glow effect with neon border accents.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <div className="bg-slate-950 p-6 rounded-xl">
                <Card variant="gradient" className="max-w-sm">
                  <CardHeader>
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      Gradient Card
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      A multi-color gradient card variant.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Features a colorful gradient overlay for visual appeal.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Card Structure</h3>
              <Card className="max-w-sm">
                <CardHeader>
                  <CardTitle>Header Section</CardTitle>
                  <CardDescription>
                    Card headers contain the title and description.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted text-sm">
                    Content is the main body of the card where you place your
                    primary information.
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                  <Button size="sm">Save</Button>
                </CardFooter>
              </Card>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Pricing Card (Neon)</h3>
              <div className="bg-slate-950 p-6 rounded-xl">
                <Card variant="neon" className="max-w-sm">
                  <CardHeader>
                    <CardTitle className="text-cyan-400 text-2xl">
                      Pro Plan
                    </CardTitle>
                    <CardDescription className="text-cyan-300">
                      For growing teams
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-1">
                      <span className="text-cyan-400 text-3xl font-bold">
                        $29
                      </span>
                      <span className="text-cyan-300 text-sm">/month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-cyan-200">
                      <li>10 GB storage</li>
                      <li>Priority support</li>
                      <li>Advanced analytics</li>
                      <li>Custom integrations</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Profile Card (Glass)</h3>
              <div className="bg-slate-950 p-6 rounded-xl">
                <Card variant="glass" className="max-w-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                      <div>
                        <CardTitle className="text-white">
                          Sarah Johnson
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                          Frontend Developer
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Passionate about building beautiful user interfaces and
                      design systems.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Badge variant="glass">React</Badge>
                      <Badge variant="glass">TypeScript</Badge>
                      <Badge variant="glass">Tailwind</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 text-white">
                      Message
                    </Button>
                    <Button size="sm" className="bg-white/20 text-white hover:bg-white/30">
                      Follow
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">
                Feature Cards (Gradient)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl">
                  <Card variant="gradient">
                    <CardHeader>
                      <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Speed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Blazing fast performance with optimized rendering and
                        lazy loading.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl">
                  <Card variant="gradient">
                    <CardHeader>
                      <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Enterprise-grade security with encryption at rest and in
                        transit.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl">
                  <Card variant="gradient">
                    <CardHeader>
                      <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
                        Scalability
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Scales effortlessly from small projects to enterprise
                        applications.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Stats Dashboard (Shiny)</h3>
              <div className="bg-slate-950 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card variant="shiny">
                    <CardHeader>
                      <CardDescription className="text-slate-400">
                        Total Revenue
                      </CardDescription>
                      <CardTitle className="text-white text-2xl">
                        $45,231.89
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="success">+20.1% from last month</Badge>
                    </CardContent>
                  </Card>
                  <Card variant="shiny">
                    <CardHeader>
                      <CardDescription className="text-slate-400">
                        Subscriptions
                      </CardDescription>
                      <CardTitle className="text-white text-2xl">
                        +2,350
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="success">+180.1% from last month</Badge>
                    </CardContent>
                  </Card>
                  <Card variant="shiny">
                    <CardHeader>
                      <CardDescription className="text-slate-400">
                        Active Users
                      </CardDescription>
                      <CardTitle className="text-white text-2xl">
                        +12,234
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="info">+19% from last month</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Project Card with Like</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="max-w-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Tailwind CSS</CardTitle>
                        <CardDescription>
                          A utility-first CSS framework
                        </CardDescription>
                      </div>
                      <Badge variant="success">Stable</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted text-sm">
                      Rapidly build modern websites without ever leaving your
                      HTML.
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
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

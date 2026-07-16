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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { FieldMessages } from "@/components/ui/field-messages";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

// ---------- Login Tab ----------

interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  errors: {
    email?: string;
    password?: string;
    form?: string;
  };
}

function validateLoginForm(
  email: string,
  password: string,
): { email?: string; password?: string } {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
}

async function handleLoginSubmit(
  form: LoginFormState,
  setForm: React.Dispatch<React.SetStateAction<LoginFormState>>,
) {
  const fieldErrors = validateLoginForm(form.email, form.password);
  if (fieldErrors.email || fieldErrors.password) {
    setForm((p) => ({ ...p, errors: { ...fieldErrors } }));
    return;
  }

  setForm((p) => ({ ...p, loading: true, errors: {} }));

  await new Promise((resolve) => setTimeout(resolve, 2000));

  setForm((p) => ({
    ...p,
    loading: false,
    errors: { form: "Invalid credentials. Please try again." },
  }));
}

function LoginTab() {
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    rememberMe: false,
    loading: false,
    errors: {},
  });

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="login-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                email: e.target.value,
                errors: { ...p.errors, email: undefined, form: undefined },
              }))
            }
            error={form.errors.email}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                password: e.target.value,
                errors: { ...p.errors, password: undefined, form: undefined },
              }))
            }
            error={form.errors.password}
          />
        </div>
        <Checkbox
          label="Remember me"
          checked={form.rememberMe}
          onChange={(e) =>
            setForm((p) => ({ ...p, rememberMe: e.target.checked }))
          }
        />
        {form.errors.form && <FieldMessages error={form.errors.form} />}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          loading={form.loading}
          onClick={() => handleLoginSubmit(form, setForm)}
        >
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
}

// ---------- Profile Card Tab ----------

function handleLike(
  liked: boolean,
  setLiked: React.Dispatch<React.SetStateAction<boolean>>,
  setCount: React.Dispatch<React.SetStateAction<number>>,
) {
  setLiked((p) => !p);
  setCount((c) => (liked ? c - 1 : c + 1));
}

function ProfileCardTab() {
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
              Passionate about building beautiful user interfaces and
              design systems.
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
      </section>
    </div>
  );
}

// ---------- Stats Dashboard Tab ----------

function StatsDashboardTab() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Stats Dashboard</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">$45,231.89</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">+20.1% from last month</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Subscriptions</CardDescription>
            <CardTitle className="text-2xl">+2,350</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">+180.1% from last month</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-2xl">+12,234</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="info">+19% from last month</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Feature Cards Tab ----------

function FeatureCardsTab() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Feature Cards</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Blazing fast performance with optimized rendering and
              lazy loading.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Enterprise-grade security with encryption at rest and in
              transit.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scalability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Scales effortlessly from small projects to enterprise
              applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Pricing Tiers Tab ----------

function PricingTiersTab() {
  const tiers = [
    {
      name: "Starter",
      price: 19,
      description: "For individuals and small projects",
      features: [
        "5 GB cloud storage",
        "1 team member",
        "Basic analytics dashboard",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      price: 49,
      description: "For growing teams and businesses",
      features: [
        "50 GB cloud storage",
        "Up to 10 team members",
        "Advanced analytics & reports",
        "Priority email & chat support",
        "Custom integrations",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For large organizations",
      features: [
        "Unlimited cloud storage",
        "Unlimited team members",
        "Advanced analytics & reports",
        "Dedicated account manager",
        "Custom integrations & SSO",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          variant={tier.popular ? "interactive" : "default"}
          className={tier.popular ? "relative border-brand" : ""}
        >
          {tier.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${tier.price}</span>
              <span className="text-muted text-sm">/month</span>
            </div>
            <ul className="text-muted space-y-2 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={tier.popular ? "default" : "outline"}
            >
              {tier.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// ---------- Variant Gallery Tab ----------

function VariantGalleryTab() {
  return (
    <VariantGallery
      variants={["default", "elevated", "interactive"]}
      sizes={["sm", "md", "lg"]}
      render={(variant, size) => (
        <Card
          variant={
            variant as
              | "default"
              | "elevated"
              | "interactive"
              | "outline"
              | "surface"
          }
          className="min-w-32"
        >
          <CardContent
            className={
              size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4"
            }
          >
            <p className="text-muted text-xs">
              Variant: {variant}
              <br />
              Size: {size}
            </p>
          </CardContent>
        </Card>
      )}
    />
  );
}

// ---------- Page ----------

export default function CardPage({ initialTab }: { initialTab?: string }) {
  const examples: UIExample[] = [
    {
      id: "profile-card",
      title: "Profile Card",
      description: "Profile card with avatar, badges, and action buttons.",
      render: () => <ProfileCardTab />,
    },
    {
      id: "stats-dashboard",
      title: "Stats Dashboard",
      description: "Stats cards showing revenue, subscriptions, and active users.",
      render: () => <StatsDashboardTab />,
    },
    {
      id: "feature-cards",
      title: "Feature Cards",
      description: "Feature highlight cards in a responsive grid.",
      render: () => <FeatureCardsTab />,
    },
    {
      id: "login",
      title: "Login",
      description: "Login card with email, password, remember-me, and validation.",
      render: () => <LoginTab />,
    },
    {
      id: "pricing-tiers",
      title: "Pricing Tiers",
      description: "Three-column pricing grid with a highlighted Professional plan.",
      render: () => <PricingTiersTab />,
    },
    {
      id: "variant-gallery",
      title: "Variant Gallery",
      description: "All card variants and sizes in a side-by-side comparison table.",
      render: () => <VariantGalleryTab />,
    },
  ];

  return (
    <ExampleTabs
      title="Card"
      intro="A container component with header, content, and footer sections."
      examples={examples}
      initialTab={initialTab}
    />
  );
}

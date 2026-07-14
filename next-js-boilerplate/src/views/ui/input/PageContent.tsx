"use client";

import { useState, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Separator } from "@/components/ui/Separator";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { InputVariant } from "@/types/ui/Input-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function handleLogin(
  e: FormEvent,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setTimeout(() => {
    setLoading(false);
    setError("Invalid email or password.");
  }, 1500);
}

function LoginCardTab() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <label htmlFor="remember-me" className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox id="remember-me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
      </div>
      <Button onClick={(e) => handleLogin(e, setLoading, setError)} loading={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  );
}

function SearchFieldTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults([
      `Showing results for "${query}"`,
      "Result 1",
      "Result 2",
      "Result 3",
    ]);
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="search-input">Search</Label>
        <Input
          id="search-input"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <Button variant="primary" onClick={handleSearch}>
        Search
      </Button>
      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((r, i) => (
            <li key={i} className="text-muted text-sm">{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function InputPage() {
  const examples: UIExample[] = [
    {
      id: "login-card",
      title: "Login Card",
      description: "Email and password fields with validation and loading state.",
      render: () => <LoginCardTab />,
    },
  {
    id: "search-field",
    title: "Search",
    description: "Search input with enter-to-submit and results list.",
    render: () => <SearchFieldTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default"]}
        sizes={[]}
        render={(variant, _size) => (
          <Input variant={variant as InputVariant} placeholder="Input" />
        )}
      />
    ),
  },
];

  return (
    <ExampleTabs
      title="Input"
      intro="A text input component with support for icons, error states, and field messages."
      examples={examples}
    />
  );
}

// S3 pattern evaluation: chat-interface primitives - we have scroll-to-bottom + useAutoScroll, a demo "Chat Pane" block on scroll-area is enough. Field/InputGroup composition - we have input-group + label + F1 messages, document composition in input demo. Base-UI-style unstyled exports - out of scope for a boilerplate (wontfix).

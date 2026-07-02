"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { REGISTER_PATH } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p className="text-muted text-sm">Loading...</p>;
  }

  if (user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-green-600">
          Signed in as <strong>{user.email}</strong>
        </p>
        <p className="text-muted text-xs">
          Role: {user.role} &middot; Status: {user.status}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">Sign In</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-muted text-xs font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="login-email"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-muted text-xs font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="login-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" data-testid="login-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-fg text-bg self-start rounded px-4 py-2 text-sm disabled:opacity-40"
          data-testid="login-submit"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-muted text-xs">
        No account?{" "}
        <Link href={REGISTER_PATH} className="text-brand underline">
          Register
        </Link>
      </p>
    </div>
  );
}

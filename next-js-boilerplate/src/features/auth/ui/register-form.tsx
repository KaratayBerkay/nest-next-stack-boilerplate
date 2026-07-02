"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/constants/routes";
import Link from "next/link";

export function RegisterForm() {
  const { register, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
      await register(email, password, name || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">Register</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-name" className="text-muted text-xs font-medium">
            Name (optional)
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reg-name"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="reg-email" className="text-muted text-xs font-medium">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reg-email"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="reg-password"
            className="text-muted text-xs font-medium"
          >
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reg-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" data-testid="reg-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-fg text-bg self-start rounded px-4 py-2 text-sm disabled:opacity-40"
          data-testid="reg-submit"
        >
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-muted text-xs">
        Already have an account?{" "}
        <Link href={LOGIN_PATH} className="text-brand underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

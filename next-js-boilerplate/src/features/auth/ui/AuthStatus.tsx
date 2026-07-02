"use client";

import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/constants/routes";
import Link from "next/link";

export function AuthStatus() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-muted text-xs">Auth...</span>;
  }

  if (!user) {
    return (
      <Link
        href={LOGIN_PATH}
        className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted text-xs">{user.email}</span>
      <button
        onClick={logout}
        className="text-xs text-red-500 underline hover:no-underline"
        data-testid="logout-btn"
      >
        Sign Out
      </button>
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, apiFetchJson } from "@/lib/api-client";

// Session snapshot fields arrive via /api/auth/me (Redis, zero-PG).
// Login/register return a subset from AuthPayload; the snapshot is the
// identity source after the first `me` call.
export type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
  status?: string;
  role: string;
  tier?: string;
};

type AuthResponse = {
  user: User;
  accessToken?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: User | null;
}) {
  const ssrUser =
    typeof window !== "undefined"
      ? (window as { __INITIAL_USER__?: User }).__INITIAL_USER__
      : undefined;

  const [user, setUser] = useState<User | null>(
    ssrUser ?? initialUser ?? null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(!ssrUser && !initialUser);
  const logoutEventRef = useRef(false);

  useEffect(() => {
    if (ssrUser || initialUser) {
      // SSR-seeded: identity is already known, but in-page consumers (the
      // messaging WS gate, for one) still need the access token. Fetch the
      // cookie-derived quadruple — zero-PG on the backend.
      apiFetch("/api/auth/token")
        .then((res) => (res.ok ? res.json() : null))
        .then((t: { accessToken?: string } | null) => {
          if (t?.accessToken) setToken(t.accessToken);
        })
        .catch(() => {});
      return;
    }

    async function load() {
      await fetch("/api/auth/device-handshake", { method: "POST" }).catch(
        () => {},
      );

      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = (await res.json()) as {
            user: User | null;
            accessToken?: string;
          };
          setUser(data.user);
          setToken(data.accessToken ?? null);
        }
      } catch {
        /* guest or offline */
      }
      setLoading(false);
    }

    load();
  }, [ssrUser, initialUser]);

  // Listen for auth:logout events dispatched by apiFetch on 401.
  useEffect(() => {
    function onAuthLogout() {
      if (logoutEventRef.current) return;
      logoutEventRef.current = true;
      setUser(null);
      setToken(null);
      const path = window.location.pathname;
      if (path !== "/auth/login" && !path.startsWith("/auth/")) {
        window.location.href = "/auth/login";
      }
    }

    window.addEventListener("auth:logout", onAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", onAuthLogout);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiFetchJson<AuthResponse>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      if (data.accessToken) setToken(data.accessToken);
    } catch (err) {
      const exception = (err as Error & { exception?: unknown }).exception;
      if (exception) throw exception;
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const data = await apiFetchJson<AuthResponse>("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        setUser(data.user);
        if (data.accessToken) setToken(data.accessToken);
      } catch (err) {
        const exception = (err as Error & { exception?: unknown }).exception;
        if (exception) throw exception;
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// `name`/`status` only arrive on login/register (full user in AuthPayload);
// session rehydration via /api/auth/me returns the Redis snapshot, which
// carries `tier` instead.
export type User = {
  id: string;
  email: string;
  name?: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let retried = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401 && !retried) {
          retried = true;
          await fetch("/api/auth/refresh", { method: "POST" });
          const retry = await fetch("/api/auth/me");
          if (retry.ok) {
            const data = (await retry.json()) as {
              user: User | null;
              accessToken?: string;
            };
            setUser(data.user);
            setToken(data.accessToken ?? null);
            setLoading(false);
            return;
          }
        }
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
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as AuthResponse;
    if (!res.ok) {
      throw new Error(
        data && "error" in data
          ? (data as unknown as { error: string }).error
          : "Login failed",
      );
    }
    setUser(data.user);
    if (data.accessToken) setToken(data.accessToken);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = (await res.json()) as AuthResponse;
      if (!res.ok) {
        throw new Error(
          data && "error" in data
            ? (data as unknown as { error: string }).error
            : "Registration failed",
        );
      }
      setUser(data.user);
      if (data.accessToken) setToken(data.accessToken);
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

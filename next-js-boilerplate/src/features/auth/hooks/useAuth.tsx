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
import { apiFetchJson } from "@/lib/api-client";
import { TIMEZONE_COOKIE } from "@/constants/i18n";
import type { AuthProviderProps } from "@/types/auth/AuthProvider-types";
import { AUTH_LOGIN_MFA_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import { loginServer } from "@/api/server/auth/login";
import { registerServer } from "@/api/server/auth/register";
import { logoutServer } from "@/api/server/auth/logout";
import { getMeServer } from "@/api/server/auth/me";
import { refreshTokenServer } from "@/api/server/auth/token";
import { deviceHandshakeServer } from "@/api/server/auth/device-handshake";

// Session snapshot fields arrive via /api/auth/me (Redis, zero-PG).
// Login/register return a subset from AuthPayload; the snapshot is the
// identity source after the first `me` call.
import type { User } from "@/types/auth/User";

export type { User } from "@/types/auth/User";

type AuthResponse = {
  user: User;
  accessToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Internal channel for the SSR session bridge. Raw inline <script> tags in
// the body (the old window.__INITIAL_USER__ approach) break React 19
// hydration, so the session streams in as RSC props via SessionHydrator.
const AuthHydrateContext = createContext<
  ((user: User, token: string | null) => void) | null
>(null);

export function SessionHydrator({
  user,
  token,
}: {
  user: User;
  token: string | null;
}) {
  const hydrate = useContext(AuthHydrateContext);
  useEffect(() => {
    hydrate?.(user, token);
  }, [hydrate, user, token]);
  return null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialUser);
  const logoutEventRef = useRef(false);
  const ssrHydratedRef = useRef(false);

  const hydrateFromSSR = useCallback((u: User, t: string | null) => {
    ssrHydratedRef.current = true;
    setUser(u);
    if (t) setToken(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    // SessionHydrator (a descendant) already delivered the SSR session —
    // child effects run before parent effects, so the guard is set by now.
    if (ssrHydratedRef.current) return;

    if (initialUser) {
      refreshTokenServer()
        .then((t) => {
          if (t?.accessToken) setToken(t.accessToken);
        })
        .catch(() => {});
      return;
    }

    async function load() {
      await deviceHandshakeServer();

      try {
        const data = await getMeServer();
        if (data.user) {
          setUser(data.user);
          setToken(data.accessToken ?? null);
        }
      } catch {
        /* guest or offline */
      }
      setLoading(false);
    }

    load();
  }, [initialUser]);

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

  function readTimezone(): string | undefined {
    const match = document.cookie.match(
      new RegExp(`${TIMEZONE_COOKIE}=([^;]+)`),
    );
    return match?.[1];
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await loginServer(email, password, readTimezone());
      setUser(data.user);
      if (data.accessToken) setToken(data.accessToken);
    } catch (err) {
      if ((err as Error & { mfaRequired?: boolean }).mfaRequired) throw err;
      const exception = (err as Error & { exception?: unknown }).exception;
      if (exception) throw exception;
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const data = await registerServer(
          email,
          password,
          name,
          readTimezone(),
        );
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

  const verifyMfa = useCallback(async (mfaToken: string, code: string) => {
    try {
      const data = await apiFetchJson<AuthResponse>(AUTH_LOGIN_MFA_URL, {
        method: POST,
        headers: JSON_CONTENT_TYPE_HEADER,
        body: JSON.stringify({ mfaToken, code }),
      });
      setUser(data.user);
      if (data.accessToken) setToken(data.accessToken);
    } catch (err) {
      const exception = (err as Error & { exception?: unknown }).exception;
      if (exception) throw exception;
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutServer();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await getMeServer();
      if (data.user) setUser(data.user);
    } catch {
      /* silent */
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      verifyMfa,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, verifyMfa, register, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>
      <AuthHydrateContext.Provider value={hydrateFromSSR}>
        {children}
      </AuthHydrateContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

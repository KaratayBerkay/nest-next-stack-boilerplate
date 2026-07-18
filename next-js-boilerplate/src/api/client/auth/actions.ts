"use client";

import { loginServer } from "@/api/server/auth/login";
import { registerServer } from "@/api/server/auth/register";
import { logoutServer } from "@/api/server/auth/logout";
import { refreshTokenServer } from "@/api/server/auth/token";
import { verifyEmailServer } from "@/api/server/auth/verify-email";
import { requestPasswordResetServer } from "@/api/server/auth/request-password-reset";
import { resetPasswordServer } from "@/api/server/auth/reset-password";

export function useAuthActions() {
  const login = async (email: string, password: string, timezone?: string) =>
    loginServer(email, password, timezone);

  const register = async (
    email: string,
    password: string,
    name?: string,
    timezone?: string,
  ) => registerServer(email, password, name, timezone);

  const logout = async () => logoutServer();

  const refreshToken = async () => refreshTokenServer();

  const verifyEmail = async (token: string) => verifyEmailServer(token);

  const requestPasswordReset = async (email: string) =>
    requestPasswordResetServer(email);

  const resetPassword = async (token: string, newPassword: string) =>
    resetPasswordServer(token, newPassword);

  return {
    login,
    register,
    logout,
    refreshToken,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
  };
}

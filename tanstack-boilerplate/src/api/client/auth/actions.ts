"use client";

import { loginServer } from "@/api/server/auth/login";
import { registerServer } from "@/api/server/auth/register";
import { logoutServer } from "@/api/server/auth/logout";
import { refreshTokenServer } from "@/api/server/auth/token";
import {
  verifyEmailServer,
  verifyEmailCodeServer,
  resendEmailCodeServer,
} from "@/api/server/auth/verify-email";
import { requestPasswordResetServer } from "@/api/server/auth/request-password-reset";
import { resetPasswordServer } from "@/api/server/auth/reset-password";
import { changePasswordServer } from "@/api/server/auth/change-password";
import { undoPasswordChangeServer } from "@/api/server/auth/undo-password-change";
import {
  enrollMfaServer,
  verifyMfaEnrollmentServer,
  disableMfaServer,
  resendLoginCodeServer,
} from "@/api/server/auth/mfa";
import type {
  EnrollMfaResult,
  VerifyMfaResult,
  DisableMfaResult,
} from "@/api/server/auth/mfa";

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

  const verifyEmailCode = async (userId: string, code: string) =>
    verifyEmailCodeServer(userId, code);

  const resendEmailCode = async (userId: string, email: string) =>
    resendEmailCodeServer(userId, email);

  const requestPasswordReset = async (email: string) =>
    requestPasswordResetServer(email);

  const resetPassword = async (token: string, newPassword: string) =>
    resetPasswordServer(token, newPassword);

  const changePassword = async (currentPassword: string, newPassword: string) =>
    changePasswordServer(currentPassword, newPassword);

  const undoPasswordChange = async (token: string) =>
    undoPasswordChangeServer(token);

  const enrollMfa = async (): Promise<EnrollMfaResult> => enrollMfaServer();

  const verifyMfaEnrollment = async (code: string): Promise<VerifyMfaResult> =>
    verifyMfaEnrollmentServer(code);

  const disableMfa = async (code: string): Promise<DisableMfaResult> =>
    disableMfaServer(code);

  const resendLoginCode = async (mfaToken: string) =>
    resendLoginCodeServer(mfaToken);

  return {
    login,
    register,
    logout,
    refreshToken,
    verifyEmail,
    verifyEmailCode,
    resendEmailCode,
    requestPasswordReset,
    resetPassword,
    changePassword,
    undoPasswordChange,
    enrollMfa,
    verifyMfaEnrollment,
    disableMfa,
    resendLoginCode,
  };
}

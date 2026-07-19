import { describe, it, expect, vi } from "vitest";
import { submitProfile } from "../PageContent";
import type { ExceptionResponse } from "@/lib/api-client";

function makeStubDeps() {
  return {
    updateProfile: vi.fn().mockResolvedValue(undefined),
    toast: vi.fn(),
    messages: { errors: { unknown: "An unexpected error occurred" } },
    unknownError: "An unexpected error occurred",
    saveSuccess: "Profile updated successfully",
  };
}

const defaultValue = {
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  bio: "Hello",
  email: "john@test.com",
  country: "us",
  language: "en",
  newsletter: true,
  interests: ["tech"],
  role: "user",
  birthDate: undefined,
  meetingTime: { hours: 0, minutes: 0, seconds: 0 },
  notificationPrefs: { email: true, push: false, sms: false },
  avatar: [] as { id: string; file: File; progress: number; status: string; preview?: string }[],
} as unknown as Parameters<typeof submitProfile>[0]["value"];

describe("submitProfile", () => {
  it("returns null on success", async () => {
    const deps = makeStubDeps();
    const result = await submitProfile({ value: defaultValue }, deps);
    expect(result).toBeNull();
    expect(deps.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "default" }),
    );
  });

  it("returns field errors from mapper on field-level exception", async () => {
    const deps = makeStubDeps();
    deps.updateProfile.mockRejectedValue({
      exception: {
        statusCode: 422,
        exc: "EX_VALIDATION_FORM",
        msg: "Name is required",
        key: "errors.missing",
        fields: [{ field: "name", msg: "Name is required", key: "errors.missing" }],
      } satisfies ExceptionResponse,
    });
    const result = await submitProfile({ value: defaultValue }, deps);
    expect(result).not.toBeNull();
    expect(result!.form).toBeNull();
    expect(result!.fields).toEqual({ name: "Name is required" });
    expect(deps.toast).not.toHaveBeenCalled();
  });

  it("calls deps.toast and returns null for toast-surface exception", async () => {
    const deps = makeStubDeps();
    deps.updateProfile.mockRejectedValue({
      exception: {
        statusCode: 500,
        exc: "EX_INTERNAL",
        msg: "Something went wrong",
        key: "errors.unknown",
      } satisfies ExceptionResponse,
    });
    const result = await submitProfile({ value: defaultValue }, deps);
    expect(result).toBeNull();
    expect(deps.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });

  it("returns generic form error when no .exception on error", async () => {
    const deps = makeStubDeps();
    deps.updateProfile.mockRejectedValue(new Error("Network failure"));
    const result = await submitProfile({ value: defaultValue }, deps);
    expect(result).toEqual({ form: deps.unknownError, fields: {} });
  });
});

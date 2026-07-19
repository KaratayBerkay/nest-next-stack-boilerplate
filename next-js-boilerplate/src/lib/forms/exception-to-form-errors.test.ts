import { describe, it, expect } from "vitest";
import { exceptionToFormErrors } from "./exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";

describe("exceptionToFormErrors", () => {
  const messages = {
    errors: {
      required: "This field is required",
      notFound: "Not found",
    },
  };

  it("maps multi-field errors to fields and null form", () => {
    const exc = {
      statusCode: 422,
      exc: "EX_VALIDATION_FORM",
      msg: "Validation failed",
      key: "errors.validation",
      fields: [
        { field: "name", msg: "Name is required", key: "errors.required" },
        { field: "email", msg: "Email is required", key: "errors.required" },
      ],
    } satisfies ExceptionResponse;

    const result = exceptionToFormErrors(exc, messages);

    expect(result.form).toBeNull();
    expect(result.fields).toEqual({
      name: "This field is required",
      email: "This field is required",
    });
  });

  it("maps single field from exc.field into fields map with null form", () => {
    const exc = {
      statusCode: 404,
      exc: "EX_NOT_FOUND",
      msg: "Not found",
      key: "errors.notFound",
      field: "id",
    } satisfies ExceptionResponse;

    const result = exceptionToFormErrors(exc, messages);

    expect(result.form).toBeNull();
    expect(result.fields).toEqual({ id: "Not found" });
  });

  it("converts array path items.0.name to items[0].name", () => {
    const exc = {
      statusCode: 422,
      exc: "EX_VALIDATION_FORM",
      msg: "Validation failed",
      key: "errors.validation",
      fields: [
        { field: "items.0.name", msg: "Name is required", key: "errors.required" },
        { field: "items.1.price", msg: "Invalid price", key: "errors.invalid" },
      ],
    } satisfies ExceptionResponse;

    const result = exceptionToFormErrors(exc, {});

    expect(result.fields).toEqual({
      "items[0].name": "Name is required",
      "items[1].price": "Invalid price",
    });
  });

  it("falls back to English msg when i18n key is unknown", () => {
    const exc = {
      statusCode: 500,
      exc: "EX_INTERNAL",
      msg: "Something went wrong",
      key: "errors.missingKey",
    } satisfies ExceptionResponse;

    const result = exceptionToFormErrors(exc, messages);

    expect(result.form).toBe("Something went wrong");
    expect(result.fields).toEqual({});
  });

  it("returns form-level error when both fields[] and field are absent", () => {
    const exc = {
      statusCode: 500,
      exc: "EX_INTERNAL",
      msg: "Internal server error",
      key: "errors.internal",
    } satisfies ExceptionResponse;

    const result = exceptionToFormErrors(exc, {});

    expect(result.form).toBe("Internal server error");
    expect(result.fields).toEqual({});
  });
});

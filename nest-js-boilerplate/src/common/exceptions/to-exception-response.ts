import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { ExceptionCode } from './exception-code';
import type { ExceptionResponse } from './exception-response.interface';

type ExceptionClass = new (...args: never[]) => HttpException;

const CLASS_MAP = new Map<ExceptionClass, { exc: ExceptionCode; key: string }>([
  [ConflictException, { exc: 'EX_CONFLICT_DUPLICATE', key: 'error.conflict' }],
  [NotFoundException, { exc: 'EX_NOT_FOUND', key: 'error.notFound' }],
  [ForbiddenException, { exc: 'EX_FORBIDDEN', key: 'error.forbidden' }],
  [
    UnauthorizedException,
    { exc: 'EX_AUTH_INVALID_CREDENTIALS', key: 'error.unauthorized' },
  ],
  [BadRequestException, { exc: 'EX_VALIDATION_FORM', key: 'error.badRequest' }],
]);

// Generic, client-safe message for anything that could carry internal
// detail (a raw driver/library error, a Prisma message that names tables,
// columns and constraints). The real text is never dropped — it's logged
// server-side by GlobalHttpExceptionFilter — only withheld from the wire.
const INTERNAL_ERROR_MSG = 'Internal server error';

// Each Prisma entry carries its OWN safe `msg`: `exception.message` here reads
// like "Unique constraint failed on the fields: (`email`)" — internal schema
// disclosure — so it must never be forwarded to the client.
const PRISMA_MAP = new Map<
  string,
  { statusCode: number; exc: ExceptionCode; key: string; msg: string }
>([
  [
    'P2002',
    {
      statusCode: 409,
      exc: 'EX_CONFLICT_DUPLICATE',
      key: 'error.conflict',
      msg: 'A record with these values already exists',
    },
  ],
  [
    'P2025',
    {
      statusCode: 404,
      exc: 'EX_NOT_FOUND',
      key: 'error.notFound',
      msg: 'The requested record was not found',
    },
  ],
  [
    'P2003',
    {
      statusCode: 409,
      exc: 'EX_CONFLICT_FOREIGN_KEY',
      key: 'error.foreignKeyConflict',
      msg: 'This operation conflicts with a related record',
    },
  ],
  [
    'P2014',
    {
      statusCode: 409,
      exc: 'EX_CONFLICT_RELATION',
      key: 'error.relationConflict',
      msg: 'This operation conflicts with a required relation',
    },
  ],
  [
    'P2023',
    {
      statusCode: 400,
      exc: 'EX_INCONSISTENT_DATA',
      key: 'error.inconsistentData',
      msg: 'The request contained inconsistent data',
    },
  ],
]);

function getMessage(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') return response;
  const message = (response as { message?: unknown }).message;
  return typeof message === 'string' ? message : exception.message;
}

function hasStructuredResponse(response: unknown): response is {
  exc: string;
  msg: string;
  key?: string;
  field?: string;
  fields?: ExceptionResponse['fields'];
} {
  if (typeof response !== 'object' || response === null) return false;
  const obj = response as Record<string, unknown>;
  return typeof obj.exc === 'string' && typeof obj.msg === 'string';
}

function fromClass(exception: HttpException): ExceptionResponse | null {
  for (const [cls, entry] of CLASS_MAP) {
    if (exception instanceof cls) {
      return {
        statusCode: exception.getStatus(),
        exc: entry.exc,
        msg: getMessage(exception),
        key: entry.key,
      };
    }
  }
  return null;
}

function fromPrisma(
  exception: PrismaClientKnownRequestError,
): ExceptionResponse | null {
  const entry = PRISMA_MAP.get(exception.code);
  if (!entry) return null;
  return {
    statusCode: entry.statusCode,
    exc: entry.exc,
    // Deliberately NOT exception.message — see PRISMA_MAP's note.
    msg: entry.msg,
    key: entry.key,
  };
}

export function toExceptionResponse(exception: unknown): ExceptionResponse {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    if (hasStructuredResponse(response)) {
      return {
        statusCode: exception.getStatus(),
        exc: response.exc as ExceptionCode,
        msg: response.msg,
        key: response.key ?? 'error.internal',
        field: response.field,
        fields: response.fields,
      };
    }

    const mapped = fromClass(exception);
    if (mapped) return mapped;

    const status = exception.getStatus();
    const isServerError = status >= 500;
    return {
      statusCode: status,
      exc: isServerError ? 'EX_INTERNAL' : 'EX_VALIDATION_FORM',
      // A 5xx message can be a rethrown driver/library error wrapped in an
      // HttpException — keep it generic. 4xx messages are developer-authored
      // client errors (e.g. "You can only send messages to friends") and are
      // meant to be shown, so those pass through unchanged.
      msg: isServerError ? INTERNAL_ERROR_MSG : getMessage(exception),
      key: isServerError ? 'error.internal' : 'error.badRequest',
    };
  }

  if (exception instanceof PrismaClientKnownRequestError) {
    const mapped = fromPrisma(exception);
    if (mapped) return mapped;
  }

  // Unknown throwable: a bare Error, a rejected driver promise (ioredis
  // "ECONNREFUSED 10.0.0.5:6379", a Stripe/S3 SDK error), an unmapped Prisma
  // code, or a non-Error value. The client only ever gets a generic message —
  // the real one is logged server-side by GlobalHttpExceptionFilter — so
  // internal detail can't leak through GraphQL extensions or a REST body.
  return {
    statusCode: 500,
    exc: 'EX_INTERNAL',
    msg: INTERNAL_ERROR_MSG,
    key: 'error.internal',
  };
}

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

const PRISMA_MAP = new Map<
  string,
  { statusCode: number; exc: ExceptionCode; key: string }
>([
  [
    'P2002',
    { statusCode: 409, exc: 'EX_CONFLICT_DUPLICATE', key: 'error.conflict' },
  ],
  ['P2025', { statusCode: 404, exc: 'EX_NOT_FOUND', key: 'error.notFound' }],
  [
    'P2003',
    {
      statusCode: 409,
      exc: 'EX_CONFLICT_FOREIGN_KEY',
      key: 'error.foreignKeyConflict',
    },
  ],
  [
    'P2014',
    {
      statusCode: 409,
      exc: 'EX_CONFLICT_RELATION',
      key: 'error.relationConflict',
    },
  ],
  [
    'P2023',
    {
      statusCode: 400,
      exc: 'EX_INCONSISTENT_DATA',
      key: 'error.inconsistentData',
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
    msg: exception.message.replace(/\n/g, ' '),
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
    return {
      statusCode: status,
      exc: status >= 500 ? 'EX_INTERNAL' : 'EX_VALIDATION_FORM',
      msg: getMessage(exception),
      key: status >= 500 ? 'error.internal' : 'error.badRequest',
    };
  }

  if (exception instanceof PrismaClientKnownRequestError) {
    const mapped = fromPrisma(exception);
    if (mapped) return mapped;
  }

  const message =
    exception instanceof Error ? exception.message : 'Internal server error';
  return {
    statusCode: 500,
    exc: 'EX_INTERNAL',
    msg: message,
    key: 'error.internal',
  };
}

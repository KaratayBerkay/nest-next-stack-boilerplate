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

type ExceptionClass = new (...args: unknown[]) => HttpException;

const CLASS_TO_DEFAULT: {
  class: ExceptionClass;
  exc: ExceptionCode;
  key: string;
}[] = [
  { class: ConflictException, exc: 'EX_CONFLICT_DUPLICATE', key: 'error.conflict' },
  { class: NotFoundException, exc: 'EX_NOT_FOUND', key: 'error.notFound' },
  { class: ForbiddenException, exc: 'EX_FORBIDDEN', key: 'error.forbidden' },
  { class: UnauthorizedException, exc: 'EX_AUTH_INVALID_CREDENTIALS', key: 'error.unauthorized' },
  { class: BadRequestException, exc: 'EX_VALIDATION_FORM', key: 'error.badRequest' },
];

function getMessage(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') return response;
  const message = (response as { message?: unknown }).message;
  return typeof message === 'string' ? message : exception.message;
}

export function toExceptionResponse(exception: unknown): ExceptionResponse {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;
      if (typeof obj.exc === 'string' && typeof obj.msg === 'string') {
        return {
          statusCode: exception.getStatus(),
          exc: obj.exc as ExceptionCode,
          msg: obj.msg,
          key: typeof obj.key === 'string' ? obj.key : 'error.internal',
          field: typeof obj.field === 'string' ? obj.field : undefined,
          fields: Array.isArray(obj.fields)
            ? obj.fields as ExceptionResponse['fields']
            : undefined,
        };
      }
    }

    const status = exception.getStatus();
    for (const entry of CLASS_TO_DEFAULT) {
      if (exception instanceof entry.class) {
        return {
          statusCode: status,
          exc: entry.exc,
          msg: getMessage(exception),
          key: entry.key,
        };
      }
    }

    return {
      statusCode: status,
      exc: status >= 500 ? 'EX_INTERNAL' : 'EX_VALIDATION_FORM',
      msg: getMessage(exception),
      key: status >= 500 ? 'error.internal' : 'error.badRequest',
    };
  }

  if (exception instanceof PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: 409,
          exc: 'EX_CONFLICT_DUPLICATE',
          msg: exception.message.replace(/\n/g, ' '),
          key: 'error.conflict',
        };
      case 'P2025':
        return {
          statusCode: 404,
          exc: 'EX_NOT_FOUND',
          msg: exception.message.replace(/\n/g, ' '),
          key: 'error.notFound',
        };
    }
  }

  const message = exception instanceof Error ? exception.message : 'Internal server error';
  return {
    statusCode: 500,
    exc: 'EX_INTERNAL',
    msg: message,
    key: 'error.internal',
  };
}

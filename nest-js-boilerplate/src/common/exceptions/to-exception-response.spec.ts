import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { toExceptionResponse } from './to-exception-response';

describe('toExceptionResponse', () => {
  describe('HttpException subclasses (default mapping)', () => {
    it('maps ConflictException to EX_CONFLICT_DUPLICATE / 409', () => {
      const result = toExceptionResponse(
        new ConflictException('Email already registered'),
      );
      expect(result).toEqual({
        statusCode: 409,
        exc: 'EX_CONFLICT_DUPLICATE',
        msg: 'Email already registered',
        key: 'error.conflict',
      });
    });

    it('maps NotFoundException to EX_NOT_FOUND / 404', () => {
      const result = toExceptionResponse(
        new NotFoundException('User not found'),
      );
      expect(result).toEqual({
        statusCode: 404,
        exc: 'EX_NOT_FOUND',
        msg: 'User not found',
        key: 'error.notFound',
      });
    });

    it('maps ForbiddenException to EX_FORBIDDEN / 403', () => {
      const result = toExceptionResponse(
        new ForbiddenException('Not your post'),
      );
      expect(result).toEqual({
        statusCode: 403,
        exc: 'EX_FORBIDDEN',
        msg: 'Not your post',
        key: 'error.forbidden',
      });
    });

    it('maps UnauthorizedException to EX_AUTH_INVALID_CREDENTIALS / 401', () => {
      const result = toExceptionResponse(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(result).toEqual({
        statusCode: 401,
        exc: 'EX_AUTH_INVALID_CREDENTIALS',
        msg: 'Invalid credentials',
        key: 'error.unauthorized',
      });
    });

    it('maps BadRequestException to EX_VALIDATION_FORM / 400', () => {
      const result = toExceptionResponse(
        new BadRequestException('Validation failed'),
      );
      expect(result).toEqual({
        statusCode: 400,
        exc: 'EX_VALIDATION_FORM',
        msg: 'Validation failed',
        key: 'error.badRequest',
      });
    });
  });

  describe('structured payload override (2nd constructor arg)', () => {
    it('uses exc/msg/key from a structured object', () => {
      const result = toExceptionResponse(
        new ConflictException({
          exc: 'EX_AUTH_EMAIL_TAKEN',
          msg: 'This email is already registered',
          key: 'auth.errors.emailTaken',
        }),
      );
      expect(result).toEqual({
        statusCode: 409,
        exc: 'EX_AUTH_EMAIL_TAKEN',
        msg: 'This email is already registered',
        key: 'auth.errors.emailTaken',
      });
    });

    it('passes field and fields arrays through', () => {
      const result = toExceptionResponse(
        new BadRequestException({
          exc: 'EX_VALIDATION_FORM',
          msg: 'Please fix the errors below',
          key: 'auth.errors.validationForm',
          field: 'email',
          fields: [
            {
              field: 'email',
              msg: 'Invalid email',
              key: 'auth.errors.emailInvalid',
            },
            {
              field: 'password',
              msg: 'Too short',
              key: 'auth.errors.passwordTooShort',
            },
          ],
        }),
      );
      expect(result.statusCode).toBe(400);
      expect(result.exc).toBe('EX_VALIDATION_FORM');
      expect(result.field).toBe('email');
      expect(result.fields).toHaveLength(2);
    });

    it('defaults key to error.internal when not provided in structured payload', () => {
      const result = toExceptionResponse(
        new ConflictException({
          exc: 'EX_CONFLICT_DUPLICATE',
          msg: 'Duplicate',
        }),
      );
      expect(result.key).toBe('error.internal');
    });
  });

  describe('generic HttpException (non-subclass)', () => {
    it('maps 4xx to EX_VALIDATION_FORM', () => {
      const result = toExceptionResponse(
        new HttpException('Custom error', 418),
      );
      expect(result.exc).toBe('EX_VALIDATION_FORM');
      expect(result.key).toBe('error.badRequest');
    });

    it('maps 5xx to EX_INTERNAL', () => {
      const result = toExceptionResponse(
        new HttpException('Server error', 500),
      );
      expect(result.exc).toBe('EX_INTERNAL');
      expect(result.key).toBe('error.internal');
    });
  });

  describe('Prisma errors', () => {
    it('maps P2002 to EX_CONFLICT_DUPLICATE / 409', () => {
      const prismaErr = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.0.0',
        },
      );
      const result = toExceptionResponse(prismaErr);
      expect(result.statusCode).toBe(409);
      expect(result.exc).toBe('EX_CONFLICT_DUPLICATE');
      expect(result.key).toBe('error.conflict');
    });

    it('maps P2025 to EX_NOT_FOUND / 404', () => {
      const prismaErr = new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      const result = toExceptionResponse(prismaErr);
      expect(result.statusCode).toBe(404);
      expect(result.exc).toBe('EX_NOT_FOUND');
      expect(result.key).toBe('error.notFound');
    });

    it('passes through unknown Prisma codes as EX_INTERNAL / 500', () => {
      const prismaErr = new PrismaClientKnownRequestError('Some error', {
        code: 'P2010',
        clientVersion: '7.0.0',
      });
      const result = toExceptionResponse(prismaErr);
      expect(result.statusCode).toBe(500);
      expect(result.exc).toBe('EX_INTERNAL');
    });
  });

  describe('non-HttpException errors', () => {
    it('SECURITY: maps a bare Error to EX_INTERNAL / 500 with a GENERIC message — the raw error text (which can carry infra detail like an ioredis "ECONNREFUSED host:port", a Stripe/S3 SDK message, or a driver string) must never reach the client; it is logged server-side by GlobalHttpExceptionFilter instead', () => {
      const result = toExceptionResponse(
        new Error('ECONNREFUSED 10.0.0.5:6379 while SELECT ... FROM secrets'),
      );
      expect(result).toEqual({
        statusCode: 500,
        exc: 'EX_INTERNAL',
        msg: 'Internal server error',
        key: 'error.internal',
      });
      expect(result.msg).not.toContain('ECONNREFUSED');
      expect(result.msg).not.toContain('6379');
    });

    it('handles non-Error throwables', () => {
      const result = toExceptionResponse('string error');
      expect(result.statusCode).toBe(500);
      expect(result.msg).toBe('Internal server error');
    });
  });

  describe('SECURITY: internal detail is never forwarded on error paths', () => {
    it('a mapped Prisma error returns a generic message, not the schema-revealing text', () => {
      const prismaErr = new PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        { code: 'P2002', clientVersion: '7.0.0' },
      );
      const result = toExceptionResponse(prismaErr);
      expect(result.msg).not.toContain('email');
      expect(result.msg).not.toContain('constraint');
      expect(result.msg).toBe('A record with these values already exists');
    });

    it('an unknown Prisma code returns a generic 500 message, not the raw Prisma text', () => {
      const prismaErr = new PrismaClientKnownRequestError(
        'Raw connection pool timeout detail leaking internals',
        { code: 'P2010', clientVersion: '7.0.0' },
      );
      const result = toExceptionResponse(prismaErr);
      expect(result.statusCode).toBe(500);
      expect(result.msg).toBe('Internal server error');
      expect(result.msg).not.toContain('pool');
    });

    it('a 5xx HttpException carrying wrapped internal text is genericized, while a 4xx message is preserved', () => {
      const server = toExceptionResponse(
        new HttpException('downstream S3 secretKey=AKIA... failed', 502),
      );
      expect(server.exc).toBe('EX_INTERNAL');
      expect(server.msg).toBe('Internal server error');
      expect(server.msg).not.toContain('AKIA');

      const client = toExceptionResponse(
        new HttpException('You can only message friends', 418),
      );
      // 4xx developer-authored client errors still surface to the UI.
      expect(client.msg).toBe('You can only message friends');
    });
  });
});

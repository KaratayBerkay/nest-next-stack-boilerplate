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
    it('maps a bare Error to EX_INTERNAL / 500', () => {
      const result = toExceptionResponse(new Error('Something went wrong'));
      expect(result).toEqual({
        statusCode: 500,
        exc: 'EX_INTERNAL',
        msg: 'Something went wrong',
        key: 'error.internal',
      });
    });

    it('handles non-Error throwables', () => {
      const result = toExceptionResponse('string error');
      expect(result.statusCode).toBe(500);
      expect(result.msg).toBe('Internal server error');
    });
  });
});

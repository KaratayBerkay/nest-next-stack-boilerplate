import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception (docs' "Custom exceptions") — a domain-specific {@link HttpException} subclass
 * with a fixed status. Nest's built-in handling and our {@link HttpExceptionFilter} both treat it
 * like any other HttpException (it carries its own `getStatus()`).
 */
export class TeapotException extends HttpException {
  constructor(message = "I'm a teapot") {
    super(message, HttpStatus.I_AM_A_TEAPOT);
  }
}

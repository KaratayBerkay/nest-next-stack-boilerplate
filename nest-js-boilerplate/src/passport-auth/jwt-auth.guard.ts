import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Triggers the 'jwt' strategy (Bearer token) for protected routes. Named distinctly from the
// app's primary custom (non-Passport) JwtAuthGuard in src/auth to avoid confusion.
@Injectable()
export class PassportJwtAuthGuard extends AuthGuard('jwt') {}

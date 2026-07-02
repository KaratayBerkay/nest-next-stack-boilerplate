import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Triggers the 'local' strategy (username/password) for the login route.
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

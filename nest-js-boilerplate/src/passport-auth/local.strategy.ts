import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { PassportAuthService } from './passport-auth.service';
import { PassportUser } from './passport-users.service';

// passport-local strategy: validates a username/password body. PassportStrategy wires the
// `validate` return value into `req.user`. Default field names are `username`/`password`.
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: PassportAuthService) {
    super();
  }

  validate(username: string, password: string): PassportUser {
    const user = this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

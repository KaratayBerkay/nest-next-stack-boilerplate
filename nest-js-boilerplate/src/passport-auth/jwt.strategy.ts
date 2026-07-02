import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { PassportUser } from './passport-users.service';

interface JwtPayload {
  sub: number;
  username: string;
}

// passport-jwt strategy: extracts a Bearer token, verifies the signature/expiry, then `validate`
// maps the decoded payload onto `req.user`. Passport has already verified the JWT by this point.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  validate(payload: JwtPayload): PassportUser {
    return { userId: payload.sub, username: payload.username };
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportUser, PassportUsersService } from './passport-users.service';

@Injectable()
export class PassportAuthService {
  constructor(
    private readonly usersService: PassportUsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Returns the user (minus password) on a credential match, else null. The docs type this as
  // `Promise<any>`; under strict mode we return a concrete `PassportUser | null` instead.
  validateUser(username: string, pass: string): PassportUser | null {
    const user = this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  // Exchanges an authenticated user for a signed JWT. `sub` is the standard subject claim.
  login(user: PassportUser): { access_token: string } {
    const payload = { username: user.username, sub: user.userId };
    return { access_token: this.jwtService.sign(payload) };
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { ApiKeysService } from './api-keys.service';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string; tier: string };
  /** Set by ApiKeyGuard when the request authenticates via API key. */
  _authenticatedByApiKey?: boolean;
}

/**
 * Guard that authenticates requests carrying `Authorization: Bearer bp_...` API keys.
 *
 * When used alongside SessionAuthGuard, place this guard FIRST so it can intercept
 * API key tokens before SessionAuthGuard attempts JWT verification (which would fail
 * on a `bp_` token). If this guard authenticates the request, it sets
 * `req._authenticatedByApiKey = true` so SessionAuthGuard skips.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeys: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = GqlExecutionContext.create(context).getContext<{
      req: AuthedRequest;
    }>().req;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer bp_')) {
      return true; // not an API key request, skip — let SessionAuthGuard handle it
    }

    const key = authHeader.slice(7);
    const result = await this.apiKeys.validate(key);

    if (!result) {
      throw new UnauthorizedException({
        exc: 'EX_API_KEY_INVALID',
        msg: 'Invalid or expired API key',
        key: 'apiKeys.errors.invalid',
      });
    }

    req.user = {
      userId: result.userId,
      role: result.role,
      tier: result.tier,
    };
    req._authenticatedByApiKey = true;

    return true;
  }
}

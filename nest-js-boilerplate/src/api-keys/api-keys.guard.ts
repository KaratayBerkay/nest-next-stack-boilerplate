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
}

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

    return true;
  }
}

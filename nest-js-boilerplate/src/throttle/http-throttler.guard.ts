import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerLimitDetail } from '@nestjs/throttler';
import { parseDeviceType } from '../common/utils/device-type';

@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(HttpThrottlerGuard.name);

  protected getRequestResponse(context: ExecutionContext): {
    req: Record<string, unknown>;
    res: Record<string, unknown>;
  } {
    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<Record<string, unknown>>();
      return {
        req: ctx.req as Record<string, unknown>,
        res: ctx.res as Record<string, unknown>,
      };
    }
    return super.getRequestResponse(context);
  }

  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const { req } = this.getRequestResponse(context);
    const request = req as {
      ip?: string;
      url?: string;
      method?: string;
      headers?: Record<string, string | string[] | undefined>;
    };

    this.logger.log({
      category: 'network',
      event: 'network.rate_limited',
      ip: request.ip,
      path: request.url,
      method: request.method,
      userAgent: request.headers?.['user-agent'],
      deviceType: parseDeviceType(
        request.headers?.['user-agent'] as string | undefined,
      ),
    });

    return super.throwThrottlingException(context, throttlerLimitDetail);
  }
}

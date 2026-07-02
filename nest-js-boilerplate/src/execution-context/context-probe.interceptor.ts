import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { Roles } from './roles.decorator';
import type { Request } from 'express';

// Everything this interceptor observes via the ExecutionContext + Reflector, captured so an e2e
// can assert it. This is the canonical place the framework hands you an ExecutionContext.
export interface ContextProbe {
  type: string;
  className: string;
  handlerName: string;
  method: string;
  path: string;
  argByIndexIsRequest: boolean;
  rolesFromHandler: string[] | undefined;
  rolesOverride: string[] | undefined;
  rolesMerge: string[];
  permissions: string[] | undefined;
}

@Injectable()
export class ContextProbeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Switch to the HTTP context rather than coupling to argument positions.
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const probe: ContextProbe = {
      type: context.getType(),
      className: context.getClass().name, // the Controller CLASS (not instance)
      handlerName: context.getHandler().name, // the method about to run
      method: request.method,
      path: request.url,
      // getArgByIndex(0) is the same request object switchToHttp() returns.
      argByIndexIsRequest: context.getArgByIndex(0) === request,
      // Reflector#get reads metadata off a single target (the handler here).
      rolesFromHandler: this.reflector.get(Roles, context.getHandler()),
      // getAllAndOverride: method-level wins over class-level.
      rolesOverride: this.reflector.getAllAndOverride(Roles, [
        context.getHandler(),
        context.getClass(),
      ]),
      // getAllAndMerge: combine class + method.
      rolesMerge: this.reflector.getAllAndMerge(Roles, [
        context.getHandler(),
        context.getClass(),
      ]),
      // Low-level @SetMetadata read by string key.
      permissions: this.reflector.get<string[]>(
        PERMISSIONS_KEY,
        context.getHandler(),
      ),
    };

    return next.handle().pipe(map((data: unknown) => ({ data, probe })));
  }
}

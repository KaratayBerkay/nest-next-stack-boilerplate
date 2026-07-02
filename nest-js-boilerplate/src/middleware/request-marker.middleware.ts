import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

// Class middleware (the docs' `LoggerMiddleware` shape): implements `NestMiddleware`, is a
// normal `@Injectable()` provider (so it can inject other providers), and must call `next()`.
// Instead of logging, it stamps a response header so an e2e test can observe that it ran.
@Injectable()
export class RequestMarkerMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    res.setHeader('x-class-mw', 'hit');
    next();
  }
}

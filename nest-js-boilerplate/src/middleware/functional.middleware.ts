import type { NextFunction, Request, Response } from 'express';

// Functional middleware — the docs' simpler, dependency-free alternative to a class. A plain
// function with the `(req, res, next)` signature; use this form when the middleware needs no
// injected dependencies. Each stamps a distinct header so the e2e can tell which one ran.
export function markFunctional(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader('x-fn-mw', 'hit');
  next();
}

// A second functional middleware bound to a wildcard route (see MiddlewareModule).
export function markWildcard(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader('x-wild-mw', 'hit');
  next();
}

import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

// Field middleware runs around a field's resolver: call next() to get the resolved value,
// then transform and return it (docs.nestjs.com/graphql/field-middleware).

// Transformation: mask all but the last 4 characters of a string field.
export const maskMiddleware: FieldMiddleware = async (
  _ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value: unknown = await next();
  if (typeof value !== 'string' || value.length <= 4) return value;
  return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
};

// Context access: prefix the value with the field's own name (from ctx.info).
export const prefixFieldNameMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value: unknown = await next();
  return `${ctx.info.fieldName}:${String(value)}`;
};

// Ordering demos. With [double, exclaim] the first listed is the outermost layer: it runs
// first, delegates inward via next(), and post-processes last.
export const doubleMiddleware: FieldMiddleware = async (
  _ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value: unknown = await next();
  return typeof value === 'string' ? `${value}${value}` : value;
};

export const exclaimMiddleware: FieldMiddleware = async (
  _ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value: unknown = await next();
  return typeof value === 'string' ? `${value}!` : value;
};

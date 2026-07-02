import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { MIN_TIER_KEY } from './min-tier.decorator';
import { TierGuard } from './tier.guard';

interface MockContextResult {
  context: Pick<
    ExecutionContext,
    'getType' | 'getHandler' | 'getClass' | 'getArgs' | 'getArgByIndex'
  >;
  reflector: Reflector;
}

function createMockContext(
  userTier: string | undefined,
  handlerMinTier: SubscriptionTier | undefined,
): MockContextResult {
  const req = {
    user: userTier
      ? { userId: 'u1', email: 't@t.com', role: 'USER', tier: userTier }
      : undefined,
  };
  const handler = () => {};
  if (handlerMinTier !== undefined) {
    Reflect.defineMetadata(MIN_TIER_KEY, handlerMinTier, handler);
  }
  const reflector = new Reflector();
  // GqlExecutionContext args: [0]=root, [1]=resolverArgs, [2]=context, [3]=info
  // getContext() returns getArgByIndex(2).
  const args: [null, Record<string, never>, { req: typeof req }, null] = [
    null,
    {},
    { req },
    null,
  ];
  return {
    context: {
      getType: () => 'graphql' as const,
      getHandler: () => handler,
      getClass: () => Object,
      getArgs: () => args,
      getArgByIndex: (i: number) => args[i],
    },
    reflector,
  };
}

describe('TierGuard', () => {
  it('allows access when no @MinTier is set', () => {
    const { context, reflector } = createMockContext('FREE', undefined);
    const guard = new TierGuard(reflector);
    expect(guard.canActivate(context as unknown as ExecutionContext)).toBe(
      true,
    );
  });

  it('allows access when user tier meets the minimum', () => {
    const { context, reflector } = createMockContext(
      'BASIC',
      SubscriptionTier.BASIC,
    );
    const guard = new TierGuard(reflector);
    expect(guard.canActivate(context as unknown as ExecutionContext)).toBe(
      true,
    );
  });

  it('allows access when user tier exceeds the minimum', () => {
    const { context, reflector } = createMockContext(
      'PREMIUM',
      SubscriptionTier.BASIC,
    );
    const guard = new TierGuard(reflector);
    expect(guard.canActivate(context as unknown as ExecutionContext)).toBe(
      true,
    );
  });

  it('denies access when user tier is below the minimum', () => {
    const { context, reflector } = createMockContext(
      'FREE',
      SubscriptionTier.BASIC,
    );
    const guard = new TierGuard(reflector);
    expect(() =>
      guard.canActivate(context as unknown as ExecutionContext),
    ).toThrow(ForbiddenException);
  });

  it('denies access when user is not authenticated', () => {
    const { context, reflector } = createMockContext(
      undefined,
      SubscriptionTier.BASIC,
    );
    const guard = new TierGuard(reflector);
    expect(() =>
      guard.canActivate(context as unknown as ExecutionContext),
    ).toThrow(ForbiddenException);
  });
});

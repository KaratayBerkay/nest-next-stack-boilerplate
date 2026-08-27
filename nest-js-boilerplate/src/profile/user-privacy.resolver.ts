import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../@generated/user/user.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * Cross-cutting privacy enforcement for EVERY GraphQL surface that returns
 * the generated `User` type — friend search (`users`), admin search,
 * `Meeting.host`, `LiveStream.broadcaster`, `Post.author`, `myProfile`,
 * `AuthPayload.user`, and any future resolver that includes a user relation.
 *
 * Before this existed, each resolver had to remember to null out `avatarUrl`
 * for hide-avatar users itself; most did (messaging conversations, post
 * author, notification actor), but the ones that didn't (`users` search,
 * meeting host, stream broadcaster) silently leaked the hidden avatar. A
 * field resolver on the type itself is the one place the redaction can't be
 * forgotten per-surface.
 *
 * No class-level guard, deliberately: field resolvers only get 'interceptors'
 * enhancers (see GraphQLModule's fieldResolverEnhancers), and this type also
 * appears on PUBLIC auth mutations (login/register return AuthPayload.user
 * before any session exists). There, `req.user` is undefined — and the row
 * being returned is always the caller's own, so a missing viewer means "no
 * redaction", never "redact everything".
 *
 * Relies on the source row carrying `hideAvatar` (services returning full
 * Prisma rows always do). A row selected without it simply can't be redacted
 * here — same behavior as before this resolver existed — and rows that were
 * ALREADY redacted upstream (avatarUrl nulled, hideAvatar stripped) pass
 * through unchanged.
 */
@Resolver(() => User)
export class UserPrivacyResolver {
  @ResolveField(() => String, { nullable: true })
  avatarUrl(
    @Parent() user: User & { hideAvatar?: boolean },
    @CurrentUser() viewer: JwtUser | undefined,
  ): string | null {
    if (user.hideAvatar && viewer && user.id !== viewer.userId) return null;
    return user.avatarUrl ?? null;
  }

  /**
   * Owner-only readback of the hide-avatar toggle. The Prisma column is
   * `@HideField()`'d (other users must never see it), but the mobile app's
   * `myProfile { hideAvatar }` selection needs it to render the privacy
   * settings switch — without this field in the schema that whole query
   * fails validation and the profile screen can't load at all. Anyone other
   * than the owner just gets `false`, never the real value; on the public
   * auth-mutation surfaces (no viewer) the row is the caller's own, so the
   * real value is correct there too.
   */
  @ResolveField(() => Boolean)
  hideAvatar(
    @Parent() user: User & { hideAvatar?: boolean },
    @CurrentUser() viewer: JwtUser | undefined,
  ): boolean {
    if (viewer && user.id !== viewer.userId) return false;
    return user.hideAvatar ?? false;
  }

  /**
   * Owner-only: whether another user has 2FA on is target-selection intel
   * (accounts WITHOUT it are the softer ones), so everyone else gets `false`.
   * The owner needs the real value — Flutter's login/verifyLoginMfa
   * selections read it off `AuthPayload.user` to drive the security screen.
   */
  @ResolveField(() => Boolean)
  mfaEnabled(
    @Parent() user: User & { mfaEnabled?: boolean },
    @CurrentUser() viewer: JwtUser | undefined,
  ): boolean {
    if (viewer && user.id !== viewer.userId) return false;
    return user.mfaEnabled ?? false;
  }

  /**
   * Owner-only: kept in the schema because the web BFF's verifyEmailCode
   * mutation selects it off the returned (own) row; other users' rows
   * resolve to null.
   */
  @ResolveField(() => Date, { nullable: true })
  emailVerifiedAt(
    @Parent() user: User & { emailVerifiedAt?: Date | null },
    @CurrentUser() viewer: JwtUser | undefined,
  ): Date | null {
    if (viewer && user.id !== viewer.userId) return null;
    return user.emailVerifiedAt ?? null;
  }
}

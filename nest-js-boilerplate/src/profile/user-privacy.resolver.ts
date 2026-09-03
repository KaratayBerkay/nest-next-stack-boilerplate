import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../@generated/user/user.model';
import { UserRole } from '../@generated/prisma/user-role.enum';
import { UserStatus } from '../@generated/prisma/user-status.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';

/** Moderation-metadata visibility: the row's owner, admins, and the
 *  viewer-less public auth surfaces (always the caller's own row) see the
 *  real value; everyone else gets the benign default. MODERATOR is
 *  deliberately not privileged — every admin surface in this codebase gates
 *  on ADMIN/SUPERADMIN only. */
function canSeeModerationFields(
  user: User,
  viewer: JwtUser | undefined,
): boolean {
  if (!viewer) return true;
  if (user.id === viewer.userId) return true;
  return (
    viewer.role === (UserRole.ADMIN as string) ||
    viewer.role === (UserRole.SUPERADMIN as string)
  );
}

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
   * CROSS-044: `role` on the generated type was readable by ANY authenticated
   * caller through the general `users(search)` query — admin/moderator
   * account discovery is target-selection intel, so non-privileged viewers
   * now get the default USER back. The admin UI keeps real values (its
   * viewer is ADMIN/SUPERADMIN); own-row surfaces are unaffected.
   */
  @ResolveField(() => UserRole)
  role(
    @Parent() user: User,
    @CurrentUser() viewer: JwtUser | undefined,
  ): `${UserRole}` {
    if (!canSeeModerationFields(user, viewer)) return UserRole.USER;
    return user.role ?? UserRole.USER;
  }

  /**
   * CROSS-044, same shape as `role`: whether another account is
   * BANNED/SUSPENDED (or still unverified) is moderation metadata, not
   * peer-visible profile data — non-privileged viewers get ACTIVE.
   */
  @ResolveField(() => UserStatus)
  status(
    @Parent() user: User,
    @CurrentUser() viewer: JwtUser | undefined,
  ): `${UserStatus}` {
    if (!canSeeModerationFields(user, viewer)) return UserStatus.ACTIVE;
    return user.status ?? UserStatus.ACTIVE;
  }

  /**
   * `email` was readable by ANY authenticated caller through the general
   * `users(search)` query — that search is global (not scoped to friends or
   * contacts), so this amounted to a name+email harvesting oracle over the
   * whole user base. Real PII, not profile data, so it's redacted the same
   * way as the other moderation-adjacent fields above, reusing
   * `canSeeModerationFields` since admins have a legitimate need to see it
   * (admin search) alongside the row's own owner. The field stays
   * non-nullable in the schema, so non-privileged viewers get `""` rather
   * than the `null` used for the nullable fields above.
   */
  @ResolveField(() => String)
  email(
    @Parent() user: User,
    @CurrentUser() viewer: JwtUser | undefined,
  ): string {
    if (!canSeeModerationFields(user, viewer)) return '';
    return user.email;
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

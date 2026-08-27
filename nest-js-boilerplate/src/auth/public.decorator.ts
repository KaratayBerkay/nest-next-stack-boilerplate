import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Exempts a single handler from `SessionAuthGuard` even though its
 * class carries the guard — for endpoints that must work for a
 * logged-out caller (e.g. guest-visible pricing).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Hostname suffixes that never belong to a public browser push service.
const FORBIDDEN_HOST_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.intranet',
  '.home.arpa',
  '.lan',
];

/**
 * Browser push endpoints are always public https URLs at a push service run
 * by the browser vendor (FCM, Mozilla autopush, WNS, APNs web push, …).
 * Anything else stored here becomes a URL this server will later POST to
 * blindly from inside the network (push-notification.service.ts delivery) —
 * i.e. a stored SSRF primitive any authenticated user could plant. Validate
 * the shape at write time: https-only, no credentials, no IP literals
 * (WHATWG URL canonicalizes decimal/octal/hex IPv4 forms to dotted-quad
 * before we look at hostname), no single-label or obviously-internal hosts.
 * Deliberately NOT a vendor allowlist so a new browser's push service
 * doesn't need a backend deploy.
 */
export function isAcceptablePushEndpoint(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (host === 'localhost') return false;
  if (FORBIDDEN_HOST_SUFFIXES.some((s) => host.endsWith(s))) return false;
  // IPv6 literals keep their brackets in URL.hostname; IPv4 literals are
  // already canonicalized to dotted-quad by the parser.
  if (host.startsWith('[') || host.includes(':')) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
  if (!host.includes('.')) return false;
  return true;
}

@Injectable()
export class PushSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    userAgent?: string,
  ) {
    if (!isAcceptablePushEndpoint(endpoint)) {
      throw new BadRequestException('Invalid push endpoint');
    }
    // `endpoint` is @unique — upsert lets Postgres's own unique index
    // (INSERT ... ON CONFLICT) resolve the race atomically. The prior
    // findUnique-then-create/update was a TOCTOU race: two concurrent
    // subscribe() calls for the same endpoint (a service worker
    // re-registering across two open tabs) could both see no existing row
    // and both attempt create(), and the loser's `endpoint` unique
    // constraint violation would surface as a raw 500 instead of the keys
    // simply being (re)saved.
    return this.prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh, auth, userAgent },
      update: { p256dh, auth, userAgent, userId },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.pushSubscription.findMany({ where: { userId } });
  }
}

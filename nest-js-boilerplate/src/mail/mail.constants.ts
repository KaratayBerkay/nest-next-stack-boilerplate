import { ConfigService } from '@nestjs/config';

/** BullMQ queue for outbound email jobs (kept off the request path). */
export const MAIL_QUEUE = 'mail';

/** Local dev DB resets (docker volume wipes, migrate reset) don't touch MXRoute
 * itself — every prior run's real noreply-<uuid>@ mailboxes survive on their end
 * with zero local MailAccount row to show for it. MxrouteAccountsService's
 * startup reconciliation only ever reclaims a mailbox at or below this disk-usage
 * (MB), well above a freshly created account's baseline (~0.06MB observed) and
 * well below a mailbox that's actually accumulated real mail (6-7.5MB observed on
 * the test-user-N@ recipient inboxes) — belt-and-suspenders alongside the
 * noreply-* naming filter so reconciliation can never touch something with real
 * content even if the naming convention ever changes. */
export const MAIL_ACCOUNT_RECONCILE_USAGE_CEILING_MB = 1;

/** Shared by MailProcessor (which domain to create pool accounts under) and
 * MxrouteAccountsService (which domain to reconcile on startup) — both need the
 * same answer, so it's derived once here rather than duplicated. Falls back to
 * MAIL_FROM's own domain since that's always been this account's domain, even
 * though MAIL_FROM itself is no longer used as a literal send-from address now
 * that sends go through the claimed/created pool account instead. */
export function resolveMailDomain(config: ConfigService): string {
  const mailFrom =
    config.get<string>('MAIL_FROM') || 'noreply@berwallet.online';
  return mailFrom.split('@')[1] || 'berwallet.online';
}

/** MXRoute caps noreply@berwallet.online at 9600/day — live-confirmed via
 * MxrouteAccountsService against api.mxroute.com on 2026-08-15 (limit: 9600, sent: 0).
 * Smoothed to an hourly rate so the queue paces sends evenly across the day instead of
 * bursting 9600 in hour one and going silent for the rest — a burst pattern that itself
 * reads as more spam-like to MXRoute's abuse detection than steady, spaced-out sending. */
export const MAIL_SEND_LIMIT_PER_HOUR = 400;
export const MAIL_SEND_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/** Buffer subtracted from MAIL_SEND_LIMIT_PER_HOUR before an account is treated as
 * exhausted by the local rolling-hour ledger (see MxrouteAccountsService) — rotates
 * one send early rather than cutting it exactly at MXRoute's real cap, absorbing
 * minor timing/counting drift between our local tracking and MXRoute's own
 * enforcement. */
export const MAIL_SEND_SAFETY_MARGIN = 1;

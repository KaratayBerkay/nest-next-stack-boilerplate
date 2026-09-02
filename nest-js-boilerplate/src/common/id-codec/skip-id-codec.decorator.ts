import { SetMetadata } from '@nestjs/common';

export const SKIP_ID_CODEC_KEY = 'skipIdCodec';

/**
 * Exempts a controller (or single handler) from the global REST id-codec
 * boundary (see IdCodecInterceptor) — for routes whose body is an external
 * payload with its own "id"-shaped fields (e.g. Stripe event ids like
 * `evt_...`) rather than our internal encrypted uuids. Without this, the
 * interceptor's eager `deepDecryptIds(request.body)` throws on the foreign
 * id before the controller ever runs, rejecting every delivery with 400
 * regardless of signature validity — confirmed live: every real Stripe
 * webhook attempt since 2026-08-29 400'd with "Invalid id", never reaching
 * StripeWebhookController's own signature check.
 */
export const SkipIdCodec = () => SetMetadata(SKIP_ID_CODEC_KEY, true);

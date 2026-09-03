// PKCE-style client binding for the mobile OAuth flow (CROSS-032).
//
// The OAuth callback comes back over the custom `flutterboilerplate://`
// scheme, which is not exclusive on Android or iOS — any app that registers
// the same scheme can receive the intent. So the `state` (and the one-time
// `claim` the backend mints) that ride on that redirect must never be enough
// on their own to redeem the session. Before launching the provider, the app
// generates a random verifier, sends only its S256 digest (`code_challenge`)
// to the backend, and keeps the verifier in memory. `loginWithOAuth` then
// requires the verifier — which never crosses the OS intent system — so an
// app that squatted the scheme holds nothing it can redeem.
//
// The digest matches the backend's `s256CodeChallenge` (RFC 7636 §4.2:
// base64url(SHA-256(ascii(verifier))), no padding) — see
// nest-js-boilerplate/src/auth/oauth/oauth.service.ts.

import 'dart:convert';
import 'dart:math';

import 'package:cryptography/cryptography.dart';

/// base64url without `=` padding, the encoding RFC 7636 mandates.
String base64UrlNoPad(List<int> bytes) =>
    base64Url.encode(bytes).replaceAll('=', '');

/// 32 bytes from the platform CSPRNG → a 43-char base64url verifier.
String generateOAuthCodeVerifier() {
  final random = Random.secure();
  final bytes = List<int>.generate(32, (_) => random.nextInt(256));
  return base64UrlNoPad(bytes);
}

/// RFC 7636 S256 challenge for [verifier].
Future<String> oauthCodeChallengeS256(String verifier) async {
  final digest = await Sha256().hash(ascii.encode(verifier));
  return base64UrlNoPad(digest.bytes);
}

import 'package:flutter_boilerplate/lib/oauth_pkce.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('oauthCodeChallengeS256', () {
    test(
        'matches the RFC 7636 Appendix B vector (and so the backend\'s '
        's256CodeChallenge) — a mismatch here means every mobile OAuth login '
        'is rejected with "code verifier rejected"', () async {
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

      expect(await oauthCodeChallengeS256(verifier), challenge);
    });
  });

  group('generateOAuthCodeVerifier', () {
    test('is a 43-char unpadded base64url string (32 random bytes)', () {
      final verifier = generateOAuthCodeVerifier();

      expect(verifier, hasLength(43));
      expect(verifier, matches(RegExp(r'^[A-Za-z0-9_-]{43}$')));
    });

    test('never repeats', () {
      final seen = {for (var i = 0; i < 64; i++) generateOAuthCodeVerifier()};

      expect(seen, hasLength(64));
    });
  });

  group('base64UrlNoPad', () {
    test('strips padding and uses the URL-safe alphabet', () {
      // 0xfb 0xff → "+/8=" in standard base64.
      expect(base64UrlNoPad([0xfb, 0xff]), '-_8');
    });
  });
}

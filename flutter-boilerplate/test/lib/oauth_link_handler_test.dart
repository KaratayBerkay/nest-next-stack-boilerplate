import 'package:flutter_boilerplate/lib/oauth_link_handler.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('parseOAuthCallbackUri', () {
    test('extracts state and claim from the app-scheme callback', () {
      final result = parseOAuthCallbackUri(
        Uri.parse(
          'flutterboilerplate://oauth/callback?state=st-1&claim=one-time',
        ),
      );

      expect(result, isNotNull);
      expect(result!.state, 'st-1');
      expect(result.claim, 'one-time');
    });

    test(
        'still parses a callback with no claim, reporting claim as null so '
        'the pending login fails loudly instead of waiting out its timeout '
        '(CROSS-032)', () {
      final result = parseOAuthCallbackUri(
        Uri.parse('flutterboilerplate://oauth/callback?state=st-1'),
      );

      expect(result, isNotNull);
      expect(result!.state, 'st-1');
      expect(result.claim, isNull);
    });

    test('ignores a callback with no state', () {
      expect(
        parseOAuthCallbackUri(
          Uri.parse('flutterboilerplate://oauth/callback?claim=x'),
        ),
        isNull,
      );
    });

    test('ignores links on other schemes, hosts, or paths', () {
      for (final raw in [
        'https://app.eys.gen.tr/oauth/callback?state=s&claim=c',
        'flutterboilerplate://other/callback?state=s&claim=c',
        'flutterboilerplate://oauth/auth/login?error=access_denied',
        'flutterboilerplate://oauth?state=s&claim=c',
        'stripe://safepay?state=s',
      ]) {
        expect(parseOAuthCallbackUri(Uri.parse(raw)), isNull, reason: raw);
      }
    });
  });
}

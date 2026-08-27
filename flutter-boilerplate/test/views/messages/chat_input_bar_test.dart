import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/views/messages/chat_input_bar.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../../test_helpers.dart';

class _MockRealtimeClient extends Mock implements RealtimeClient {}

void main() {
  setUpAll(() {
    registerFallbackValue(<String, dynamic>{});
  });

  group('ChatInputBar send button', () {
    testWidgets('enables as soon as text is typed', (tester) async {
      final client = _MockRealtimeClient();

      await pumpTestApp(
        tester,
        const ChatInputBar(conversationId: 'peer-1'),
        overrides: [realtimeProvider.overrideWithValue(client)],
      );

      IconButton sendButton() => tester.widget<IconButton>(
            find.ancestor(
              of: find.byIcon(Icons.send),
              matching: find.byType(IconButton),
            ),
          );

      // Empty field → disabled.
      expect(sendButton().onPressed, isNull);

      // Typing must re-enable the button live (regression: the disabled
      // state was computed at build time with nothing triggering a rebuild
      // per keystroke, so only the keyboard's submit action ever worked).
      await tester.enterText(find.byType(TextField), 'hey!');
      await tester.pump();
      expect(sendButton().onPressed, isNotNull);

      await tester.enterText(find.byType(TextField), '');
      await tester.pump();
      expect(sendButton().onPressed, isNull);
    });
  });
}

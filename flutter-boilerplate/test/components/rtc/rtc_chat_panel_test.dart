import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/rtc/rtc_chat_panel.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  group('RtcChatPanel', () {
    testWidgets('shows the empty state when there are no messages',
        (tester) async {
      final controller = TextEditingController();
      addTearDown(controller.dispose);

      await pumpTestApp(
        tester,
        RtcChatPanel(
          messages: const [],
          controller: controller,
          onSend: () {},
        ),
      );

      expect(find.text('No messages yet'), findsOneWidget);
    });

    testWidgets('renders sender name and text per message', (tester) async {
      final controller = TextEditingController();
      addTearDown(controller.dispose);

      await pumpTestApp(
        tester,
        RtcChatPanel(
          messages: const [
            (senderName: 'Alice', text: 'hello'),
            (senderName: 'Bob', text: 'hi there'),
          ],
          controller: controller,
          onSend: () {},
        ),
      );

      expect(
        find.textContaining('Alice: ', findRichText: true),
        findsOneWidget,
      );
      expect(
        find.textContaining('hi there', findRichText: true),
        findsOneWidget,
      );
    });

    testWidgets('send button and keyboard submit both invoke onSend',
        (tester) async {
      final controller = TextEditingController();
      addTearDown(controller.dispose);
      var sends = 0;

      await pumpTestApp(
        tester,
        RtcChatPanel(
          messages: const [],
          controller: controller,
          onSend: () => sends++,
        ),
      );

      await tester.tap(find.byIcon(Icons.send));
      expect(sends, 1);

      await tester.enterText(find.byType(TextField), 'yo');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      expect(sends, 2);
    });
  });
}

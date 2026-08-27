import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/views/chat_room/chat_room_main_content.dart';
import 'package:flutter_boilerplate/views/chat_room/chat_room_sub_components.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  Widget buildContent({
    String connectionState = 'online',
    Map<String, int> roomCounts = const {},
    required TextEditingController controller,
    required ScrollController scrollController,
  }) {
    return ChatRoomMainContent(
      room: 'general',
      roomCounts: roomCounts,
      connectionState: connectionState,
      userId: 'me',
      messageController: controller,
      scrollController: scrollController,
      onSetSidebarOpen: (_) {},
      onSend: () {},
    );
  }

  group('ChatRoomMainContent', () {
    testWidgets('header shows the online count, not the input placeholder',
        (tester) async {
      final controller = TextEditingController();
      final scroll = ScrollController();
      addTearDown(controller.dispose);
      addTearDown(scroll.dispose);

      await pumpTestApp(
        tester,
        buildContent(
          roomCounts: const {'general': 7},
          controller: controller,
          scrollController: scroll,
        ),
      );

      // Regression: the HamburgerButton's countLabel used to receive the
      // composer's "Message #general" placeholder instead of "{count} online".
      expect(find.text('7 online'), findsOneWidget);
      expect(
        find.descendant(
          of: find.byType(HamburgerButton),
          matching: find.text('Message #general'),
        ),
        findsNothing,
      );
    });

    testWidgets('composer disables and re-labels while disconnected',
        (tester) async {
      final controller = TextEditingController();
      final scroll = ScrollController();
      addTearDown(controller.dispose);
      addTearDown(scroll.dispose);

      await pumpTestApp(
        tester,
        buildContent(
          connectionState: 'disconnected',
          controller: controller,
          scrollController: scroll,
        ),
      );

      // Regression: connectionState was a hardcoded 'online', so the
      // composer never reflected a dead socket.
      final input = tester.widget<TextField>(
        find.descendant(
          of: find.byType(MessageInput),
          matching: find.byType(TextField),
        ),
      );
      expect(input.enabled, isFalse);
      expect(input.decoration?.hintText, 'Disconnected');
    });
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/scroll_to_bottom_button/scroll_to_bottom_button.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders button when visible', (tester) async {
    await pumpTestApp(
      tester,
      ScrollToBottomButton(scrollController: ScrollController()),
    );
    expect(find.byType(FloatingActionButton), findsOneWidget);
  });

  testWidgets('renders arrow down icon', (tester) async {
    await pumpTestApp(
      tester,
      ScrollToBottomButton(scrollController: ScrollController()),
    );
    expect(find.byIcon(Icons.keyboard_arrow_down), findsOneWidget);
  });

  testWidgets('hides button when visible is false', (tester) async {
    await pumpTestApp(
      tester,
      ScrollToBottomButton(
        scrollController: ScrollController(),
        visible: false,
      ),
    );
    expect(find.byType(FloatingActionButton), findsNothing);
  });

  testWidgets('calls onPressed when tapped', (tester) async {
    var pressed = false;
    await pumpTestApp(
      tester,
      ScrollToBottomButton(
        scrollController: ScrollController(),
        onPressed: () => pressed = true,
      ),
    );
    await tester.tap(find.byType(FloatingActionButton));
    expect(pressed, isTrue);
  });
}

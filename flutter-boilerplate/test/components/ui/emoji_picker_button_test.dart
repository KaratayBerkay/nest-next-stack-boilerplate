import 'package:emoji_picker_flutter/emoji_picker_flutter.dart' as picker;
import 'package:flutter_boilerplate/components/ui/emoji_picker_button/emoji_picker_button.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders a trigger with the given tooltip label', (tester) async {
    await pumpTestApp(
      tester,
      EmojiPickerButton(label: 'Pick emoji', onEmojiSelect: (_) {}),
    );

    expect(find.byTooltip('Pick emoji'), findsOneWidget);
    expect(find.byType(picker.EmojiPicker), findsNothing);
  });

  testWidgets('opens the emoji picker panel on tap', (tester) async {
    await pumpTestApp(
      tester,
      EmojiPickerButton(label: 'Pick emoji', onEmojiSelect: (_) {}),
    );

    await tester.tap(find.byTooltip('Pick emoji'));
    await tester.pumpAndSettle();

    expect(find.byType(picker.EmojiPicker), findsOneWidget);
  });
}

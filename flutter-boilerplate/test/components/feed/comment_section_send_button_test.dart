import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/feed/comment_section.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  group('CommentSection submit button', () {
    testWidgets('enables as soon as text is typed', (tester) async {
      await pumpTestApp(
        tester,
        const SingleChildScrollView(
          child: CommentSection(postId: 'p1'),
        ),
      );

      FilledButton button() =>
          tester.widget<FilledButton>(find.byType(FilledButton).first);

      // Empty field → disabled.
      expect(button().onPressed, isNull);

      // Typing must re-enable the button live (regression: the disabled
      // state was computed at build time with nothing triggering a rebuild
      // per keystroke, so it stayed disabled no matter what was typed).
      await tester.enterText(find.byType(TextField).first, 'nice post!');
      await tester.pump();
      expect(button().onPressed, isNotNull);

      // Clearing the field disables it again.
      await tester.enterText(find.byType(TextField).first, '');
      await tester.pump();
      expect(button().onPressed, isNull);
    });
  });
}

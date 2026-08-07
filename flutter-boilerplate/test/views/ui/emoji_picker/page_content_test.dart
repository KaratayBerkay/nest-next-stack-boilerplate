import 'package:flutter_boilerplate/views/ui/emoji_picker/page_content.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../../test_helpers.dart';

void main() {
  testWidgets('renders both examples without error', (tester) async {
    await pumpTestApp(tester, const EmojiPickerDemoPage(lang: 'en'));

    expect(find.text('Default'), findsOneWidget);
    expect(find.text('Composer-style usage'), findsOneWidget);
    expect(find.text('Try the emoji button'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

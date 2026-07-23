import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/kbd/kbd.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders shortcut label', (tester) async {
    await pumpTestApp(tester, const KbdWidget(label: 'Ctrl+K'));
    expect(find.text('Ctrl+K'), findsOneWidget);
  });

  testWidgets('renders single key', (tester) async {
    await pumpTestApp(tester, const KbdWidget(label: '⌘'));
    expect(find.text('⌘'), findsOneWidget);
  });

  testWidgets('renders combination keys', (tester) async {
    await pumpTestApp(tester, const KbdWidget(label: '⌘S'));
    expect(find.text('⌘S'), findsOneWidget);
  });
}

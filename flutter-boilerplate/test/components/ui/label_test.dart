import 'package:flutter_boilerplate/components/ui/label/label.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders text', (tester) async {
    await pumpTestApp(tester, const Label(text: 'Email'));
    expect(find.text('Email'), findsOneWidget);
  });

  testWidgets('renders required asterisk', (tester) async {
    await pumpTestApp(tester, const Label(text: 'Email', required: true));
    expect(find.text('Email'), findsOneWidget);
    expect(find.text(' *'), findsOneWidget);
  });

  testWidgets('does not render asterisk when not required', (tester) async {
    await pumpTestApp(tester, const Label(text: 'Name'));
    expect(find.text('Name'), findsOneWidget);
    expect(find.text(' *'), findsNothing);
  });
}

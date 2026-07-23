import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/typography/typography.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('Typography renders text', (tester) async {
    await pumpTestApp(
      tester,
      const Typography(text: 'Hello World'),
    );

    expect(find.text('Hello World'), findsOneWidget);
  });

  testWidgets('Typography renders with h1 variant', (tester) async {
    await pumpTestApp(
      tester,
      const Typography(text: 'Heading', variant: TypographyVariant.h1),
    );

    expect(find.text('Heading'), findsOneWidget);
  });

  testWidgets('Typography renders with label variant', (tester) async {
    await pumpTestApp(
      tester,
      const Typography(text: 'Label', variant: TypographyVariant.label),
    );

    expect(find.text('Label'), findsOneWidget);
  });

  testWidgets('Typography renders with code variant', (tester) async {
    await pumpTestApp(
      tester,
      const Typography(text: 'Code', variant: TypographyVariant.code),
    );

    expect(find.text('Code'), findsOneWidget);
  });
}

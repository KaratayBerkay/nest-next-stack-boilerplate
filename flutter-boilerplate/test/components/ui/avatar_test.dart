import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/avatar/avatar.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('Avatar displays initials when no image', (tester) async {
    await pumpTestApp(tester, const Avatar(name: 'John Doe'));

    expect(find.text('JD'), findsOneWidget);
  });

  testWidgets('Avatar supports onTap callback', (tester) async {
    var tapped = false;
    await pumpTestApp(
      tester,
      Avatar(name: 'Jane', onTap: () => tapped = true),
    );

    await tester.tap(find.text('J'));
    expect(tapped, isTrue);
  });
}

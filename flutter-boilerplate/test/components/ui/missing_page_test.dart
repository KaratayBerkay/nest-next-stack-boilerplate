import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/views/v1/missing_page.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('MissingPage shows 404 and message', (tester) async {
    await pumpTestApp(tester, const MissingPage(lang: 'en'));

    expect(find.text('404'), findsOneWidget);
    expect(find.text('This resource could not be found.'), findsOneWidget);
    expect(find.text('Go Home'), findsOneWidget);
  });
}

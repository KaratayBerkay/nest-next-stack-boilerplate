import 'package:flutter_boilerplate/views/v1/missing_page.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('MissingPage shows error and message', (tester) async {
    await pumpTestApp(tester, const MissingPage(lang: 'en'));

    expect(find.text('Not found'), findsOneWidget);
    expect(find.text('This v1 resource does not exist.'), findsOneWidget);
    expect(find.text('Back to v1 home'), findsOneWidget);
  });
}

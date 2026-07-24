import 'package:flutter_boilerplate/components/ui/logo_spinner/logo_spinner.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders LogoSpinner', (tester) async {
    await pumpTestApp(tester, const LogoSpinner());

    expect(find.byType(LogoSpinner), findsOneWidget);
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/navigation_menu/navigation_menu.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders navigation destinations', (tester) async {
    await pumpTestApp(
      tester,
      NavigationMenu(
        selectedIndex: 0,
        destinations: [
          const NavigationMenuDestination(label: 'Home', icon: Icons.home),
          const NavigationMenuDestination(label: 'Search', icon: Icons.search),
        ],
      ),
    );
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Search'), findsOneWidget);
  });

  testWidgets('renders body when provided', (tester) async {
    await pumpTestApp(
      tester,
      NavigationMenu(
        selectedIndex: 0,
        destinations: const [
          NavigationMenuDestination(label: 'Home', icon: Icons.home),
        ],
        body: const Text('Content'),
      ),
    );
    expect(find.text('Content'), findsOneWidget);
  });

  testWidgets('calls onDestinationSelected on tap', (tester) async {
    int? selected;
    await pumpTestApp(
      tester,
      NavigationMenu(
        selectedIndex: 0,
        onDestinationSelected: (i) => selected = i,
        destinations: const [
          NavigationMenuDestination(label: 'Home', icon: Icons.home),
          NavigationMenuDestination(label: 'Profile', icon: Icons.person),
        ],
      ),
    );
    await tester.tap(find.text('Profile'));
    expect(selected, 1);
  });

  testWidgets('highlights selected destination', (tester) async {
    await pumpTestApp(
      tester,
      NavigationMenu(
        selectedIndex: 1,
        destinations: const [
          NavigationMenuDestination(label: 'Home', icon: Icons.home),
          NavigationMenuDestination(label: 'Profile', icon: Icons.person),
        ],
      ),
    );
    final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
    expect(rail.selectedIndex, 1);
  });
}

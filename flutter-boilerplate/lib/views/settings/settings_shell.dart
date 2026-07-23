import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SettingsShell extends StatelessWidget {
  final String lang;
  final Widget child;

  const SettingsShell({
    super.key,
    required this.lang,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/v1/$lang/feed'),
        ),
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          NavigationRail(
            selectedIndex: _selectedIndex(context),
            onDestinationSelected: (i) => _navigateTo(i, context),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person),
                label: Text('Account'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.credit_card_outlined),
                selectedIcon: Icon(Icons.credit_card),
                label: Text('Billing'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.settings_outlined),
                selectedIcon: Icon(Icons.settings),
                label: Text('General'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.lock_outline),
                selectedIcon: Icon(Icons.lock),
                label: Text('Privacy'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.devices_outlined),
                selectedIcon: Icon(Icons.devices),
                label: Text('Sessions'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.vpn_key_outlined),
                selectedIcon: Icon(Icons.vpn_key),
                label: Text('API Keys'),
              ),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(child: child),
        ],
      ),
    );
  }

  int _selectedIndex(BuildContext context) {
    final path = GoRouterState.of(context).matchedLocation;
    if (path.contains('/settings/account')) return 0;
    if (path.contains('/settings/billing')) return 1;
    if (path.contains('/settings/general')) return 2;
    if (path.contains('/settings/privacy')) return 3;
    if (path.contains('/settings/sessions')) return 4;
    if (path.contains('/settings/api-keys')) return 5;
    return 0;
  }

  void _navigateTo(int index, BuildContext context) {
    final lang = GoRouterState.of(context).pathParameters['lang'] ?? 'en';
    switch (index) {
      case 0: context.go('/v1/$lang/settings/account');
      case 1: context.go('/v1/$lang/settings/billing');
      case 2: context.go('/v1/$lang/settings/general');
      case 3: context.go('/v1/$lang/settings/privacy');
      case 4: context.go('/v1/$lang/settings/sessions');
      case 5: context.go('/v1/$lang/settings/api-keys');
    }
  }
}

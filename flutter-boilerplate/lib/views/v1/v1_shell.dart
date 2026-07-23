import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../lib/container.dart';
import '../../constants/theme.dart';
import 'v1_header.dart';
import 'v1_sidebar.dart';
import 'v1_nav.dart';

class V1Shell extends ConsumerWidget {
  final String lang;
  final Widget child;

  const V1Shell({
    super.key,
    required this.lang,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopScope(
      canPop: true,
      child: Scaffold(
        appBar: V1Header(lang: lang),
        body: SafeArea(
          child: Row(
            children: [
              if (!context.isMobile)
                V1Sidebar(
                  selectedIndex: _selectedNavIndex(context),
                  onItemSelected: (i) => _onNavTap(context, i),
                ),
              Expanded(child: child),
            ],
          ),
        ),
        bottomNavigationBar: context.isMobile
            ? V1BottomNav(
                currentIndex: _selectedNavIndex(context),
                onTap: (i) => _onNavTap(context, i),
              )
            : null,
      ),
    );
  }

  int _selectedNavIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.toString();
    if (loc.contains('/feed')) return 1;
    if (loc.contains('/messages')) return 2;
    if (loc.contains('/settings')) return 3;
    return 0;
  }

  void _onNavTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/v1/$lang');
      case 1:
        context.go('/v1/$lang/feed');
      case 2:
        context.go('/v1/$lang/messages');
      case 3:
        context.go('/v1/$lang/settings');
    }
  }
}

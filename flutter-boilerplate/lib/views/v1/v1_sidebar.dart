import 'package:flutter/material.dart';

class V1Sidebar extends StatelessWidget {
  final int selectedIndex;
  final void Function(int) onItemSelected;

  const V1Sidebar({
    super.key,
    required this.selectedIndex,
    required this.onItemSelected,
  });

  @override
  Widget build(BuildContext context) {
    return NavigationRail(
      selectedIndex: selectedIndex,
      onDestinationSelected: onItemSelected,
      labelType: NavigationRailLabelType.all,
      destinations: const [
        NavigationRailDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home),
          label: Text('Home'),
        ),
        NavigationRailDestination(
          icon: Icon(Icons.article_outlined),
          selectedIcon: Icon(Icons.article),
          label: Text('Feed'),
        ),
        NavigationRailDestination(
          icon: Icon(Icons.forum_outlined),
          selectedIcon: Icon(Icons.forum),
          label: Text('Messages'),
        ),
        NavigationRailDestination(
          icon: Icon(Icons.settings_outlined),
          selectedIcon: Icon(Icons.settings),
          label: Text('Settings'),
        ),
      ],
    );
  }
}

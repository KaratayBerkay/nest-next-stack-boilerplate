import 'package:flutter/material.dart';

class NavigationMenu extends StatelessWidget {
  final int selectedIndex;
  final void Function(int)? onDestinationSelected;
  final List<NavigationMenuDestination> destinations;
  final Widget? body;

  const NavigationMenu({
    super.key,
    required this.selectedIndex,
    this.onDestinationSelected,
    required this.destinations,
    this.body,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        NavigationRail(
          selectedIndex: selectedIndex,
          onDestinationSelected: onDestinationSelected,
          labelType: NavigationRailLabelType.all,
          destinations: destinations.map((d) {
            return NavigationRailDestination(
              icon: Icon(d.icon),
              selectedIcon: d.selectedIcon != null ? Icon(d.selectedIcon) : null,
              label: Text(d.label),
            );
          }).toList(),
        ),
        if (body != null)
          Expanded(child: body!),
      ],
    );
  }
}

class NavigationMenuDestination {
  final String label;
  final IconData icon;
  final IconData? selectedIcon;

  const NavigationMenuDestination({
    required this.label,
    required this.icon,
    this.selectedIcon,
  });
}

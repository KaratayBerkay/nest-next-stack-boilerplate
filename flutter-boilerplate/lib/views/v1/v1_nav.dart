import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class V1BottomNav extends StatelessWidget {
  final int currentIndex;
  final void Function(int) onTap;

  const V1BottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return SafeArea(
      top: false,
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.home),
            label: t.v1ShellNavHome,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.article),
            label: t.v1ShellNavFeed,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.forum),
            label: t.v1ShellNavChatRoom,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.settings),
            label: t.v1ShellNavSettings,
          ),
        ],
      ),
    );
  }
}

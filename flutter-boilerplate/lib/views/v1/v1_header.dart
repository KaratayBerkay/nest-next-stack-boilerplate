import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'profile_dropdown.dart';

class V1Header extends StatelessWidget implements PreferredSizeWidget {
  final String lang;

  const V1Header({super.key, required this.lang});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text('Flutter BP'),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          tooltip: 'Notifications',
          onPressed: () => context.go('/v1/$lang/notification'),
        ),
        IconButton(
          icon: const Icon(Icons.message_outlined),
          tooltip: 'Messages',
          onPressed: () => context.go('/v1/$lang/messages'),
        ),
        ProfileDropdown(lang: lang),
      ],
    );
  }
}

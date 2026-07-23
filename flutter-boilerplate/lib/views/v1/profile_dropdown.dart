import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';

class ProfileDropdown extends StatelessWidget {
  final String lang;

  const ProfileDropdown({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return PopupMenuButton<VoidCallback>(
      icon: CircleAvatar(
        backgroundColor: colors.brand,
        radius: 16,
        child: Text(
          'U',
          style: TextStyle(color: colors.surface, fontSize: 12),
        ),
      ),
      itemBuilder: (_) => [
        PopupMenuItem<VoidCallback>(
          child: const ListTile(title: Text('Settings')),
          onTap: () => context.go('/v1/$lang/settings'),
        ),
        const PopupMenuDivider(),
        PopupMenuItem<VoidCallback>(
          child: const ListTile(title: Text('Sign Out')),
          onTap: () => context.go('/auth/login'),
        ),
      ],
    );
  }
}

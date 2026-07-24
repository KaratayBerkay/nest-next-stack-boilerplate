import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class ProfileDropdown extends StatelessWidget {
  final String lang;

  const ProfileDropdown({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return PopupMenuButton<VoidCallback>(
      icon: CircleAvatar(
        backgroundColor: colors.brand,
        radius: 16,
        child: Text(
          t.v1ShellAccount[0],
          style: TextStyle(color: colors.surface, fontSize: 12),
        ),
      ),
      itemBuilder: (_) => [
        PopupMenuItem<VoidCallback>(
          child: ListTile(title: Text(t.v1ShellSettingsLink)),
          onTap: () => context.go('/v1/$lang/settings'),
        ),
        const PopupMenuDivider(),
        PopupMenuItem<VoidCallback>(
          child: ListTile(title: Text(t.v1ShellSignOut)),
          onTap: () => context.go('/auth/login'),
        ),
      ],
    );
  }
}

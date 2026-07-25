import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../components/nav/lang_switcher.dart';
import '../../components/nav/theme_toggle.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import '../../types/auth/user.dart';

class V1Header extends ConsumerWidget implements PreferredSizeWidget {
  final String lang;
  final VoidCallback onToggleSidebar;

  const V1Header({
    super.key,
    required this.lang,
    required this.onToggleSidebar,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final authState = ref.watch(authProvider);
    final user = authState.asData?.value;
    final loading = authState.isLoading;

    return SafeArea(
      bottom: false,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: colors.surface,
          border: Border(bottom: BorderSide(color: colors.border)),
        ),
        child: Row(
          children: [
            InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: onToggleSidebar,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Icon(Icons.menu, size: 20, color: colors.fgMuted),
              ),
            ),
            const SizedBox(width: 4),
            InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () => context.go('/v1/$lang'),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: colors.brand,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          'V',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: colors.surface,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      t.v1ShellBrand,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: colors.fg,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Spacer(),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const LangSwitcher(),
                const ThemeToggle(),
                if (loading)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      t.v1ShellAuthLoading,
                      style: TextStyle(fontSize: 11, color: colors.fgMuted),
                    ),
                  )
                else if (user != null) ...[
                  InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () => context.go('/v1/$lang/notification'),
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Icon(
                        Icons.notifications_outlined,
                        size: 20,
                        color: colors.fgMuted,
                      ),
                    ),
                  ),
                  InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () => context.go('/v1/$lang/messages'),
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Icon(
                        Icons.message_outlined,
                        size: 20,
                        color: colors.fgMuted,
                      ),
                    ),
                  ),
                  _ProfileAvatar(user: user, colors: colors, lang: lang),
                ] else
                  Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () => context.go('/auth/login'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: colors.brand,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          t.v1ShellSignIn,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: colors.surface,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileAvatar extends ConsumerWidget {
  final AuthenticatedUser user;
  final AppColors colors;
  final String lang;

  const _ProfileAvatar({
    required this.user,
    required this.colors,
    required this.lang,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);

    return PopupMenuButton<String>(
      icon: CircleAvatar(
        backgroundColor: colors.brand,
        radius: 16,
        child: Text(
          _initials(user.name.isNotEmpty ? user.name : user.email),
          style: TextStyle(color: colors.surface, fontSize: 11),
        ),
      ),
      offset: const Offset(0, 44),
      itemBuilder: (_) => [
        PopupMenuItem<String>(
          enabled: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user.name.isNotEmpty ? user.name : 'User',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: colors.fg,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                user.email,
                style: TextStyle(fontSize: 11, color: colors.fgMuted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (user.tier.isNotEmpty && user.tier != 'free')
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(
                      border: Border.all(color: colors.border),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      user.tier,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w500,
                        color: colors.fgMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const PopupMenuDivider(),
        PopupMenuItem<String>(
          value: 'settings',
          child: Row(
            children: [
              Icon(Icons.settings, size: 16, color: colors.fgMuted),
              const SizedBox(width: 8),
              Text(t.v1ShellSettingsLink, style: const TextStyle(fontSize: 13)),
            ],
          ),
          onTap: () => context.go('/v1/$lang/settings/general'),
        ),
        PopupMenuItem<String>(
          value: 'signout',
          child: Row(
            children: [
              Icon(Icons.logout, size: 16, color: colors.danger),
              const SizedBox(width: 8),
              Text(
                t.v1ShellSignOut,
                style: TextStyle(fontSize: 13, color: colors.danger),
              ),
            ],
          ),
          onTap: () {
            ref.read(authProvider.notifier).logout();
            context.go('/auth/login');
          },
        ),
      ],
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    if (parts.length == 1 && parts.first.isNotEmpty) {
      return parts.first[0].toUpperCase();
    }
    return '?';
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';

class V1Nav extends ConsumerWidget {
  final String lang;
  final String currentPath;
  final VoidCallback? onNavigate;

  const V1Nav({
    super.key,
    required this.lang,
    required this.currentPath,
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final user = ref.watch(currentUserProvider);

    final base = '/v1/$lang';
    final isAdmin = user?.role == 'ADMIN' || user?.role == 'SUPERADMIN';

    final links = <_NavLink>[
      _NavLink(
        '',
        const Icon(Icons.home_outlined),
        Icons.home,
        t.v1ShellNavHome,
      ),
      _NavLink(
        '/feed',
        const Icon(Icons.rss_feed_outlined),
        Icons.rss_feed,
        t.v1ShellNavFeed,
      ),
      _NavLink(
        '/share',
        const Icon(Icons.share_outlined),
        Icons.share,
        t.v1ShellNavShare,
        auth: true,
      ),
      _NavLink(
        '/users/list',
        const Icon(Icons.people_outlined),
        Icons.people,
        t.v1ShellNavUsers,
      ),
      _NavLink(
        '/chat-room',
        const Icon(Icons.chat_outlined),
        Icons.chat,
        t.v1ShellNavChatRoom,
      ),
      _NavLink(
        '/messages',
        const Icon(Icons.mail_outlined),
        Icons.mail,
        t.v1ShellNavMessages,
      ),
      _NavLink(
        '/rtc',
        const Icon(Icons.videocam_outlined),
        Icons.videocam,
        t.v1ShellNavRtc,
        auth: true,
      ),
      _NavLink(
        '/find-friends',
        const Icon(Icons.person_add_outlined),
        Icons.person_add,
        t.v1ShellNavFindFriends,
      ),
      _NavLink(
        '/friends',
        const Icon(Icons.group_outlined),
        Icons.group,
        t.v1ShellNavFriends,
        auth: true,
      ),
      _NavLink(
        '/premium',
        const Icon(Icons.workspace_premium_outlined),
        Icons.workspace_premium,
        t.v1ShellNavPremium,
        auth: true,
      ),
      _NavLink(
        '/settings/general',
        const Icon(Icons.settings_outlined),
        Icons.settings,
        t.v1ShellNavSettings,
        auth: true,
      ),
      _NavLink(
        '/ui',
        const Icon(Icons.widgets_outlined),
        Icons.widgets,
        t.v1ShellNavUiComponents,
      ),
      _NavLink(
        '/forms',
        const Icon(Icons.description_outlined),
        Icons.description,
        t.v1ShellNavForms,
      ),
      _NavLink(
        '/boom',
        const Icon(Icons.warning_amber_outlined),
        Icons.warning_amber,
        t.v1ShellNavErrorTest,
      ),
      _NavLink(
        '/missing',
        const Icon(Icons.help_outline),
        Icons.help,
        t.v1ShellNavNotFound,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ...links.where((l) => !l.auth || user != null).map((link) {
          final full = '$base${link.href}';
          final active = currentPath == full;
          return _NavItem(
            icon: active ? link.activeIcon : link.icon,
            label: link.label,
            active: active,
            colors: colors,
            target: full,
            onNavigate: onNavigate,
          );
        }),
        if (isAdmin) ...[
          const SizedBox(height: 4),
          _NavSectionHeader(colors: colors, text: t.v1ShellNavAdmin),
          _NavItem(
            icon: currentPath == '$base/admin'
                ? const Icon(Icons.shield, size: 18)
                : const Icon(Icons.shield_outlined, size: 18),
            label: t.v1ShellNavAdmin,
            active: currentPath == '$base/admin',
            colors: colors,
            target: '$base/admin',
            onNavigate: onNavigate,
          ),
          _NavItem(
            icon: currentPath == '$base/admin/audit-logs'
                ? const Icon(Icons.visibility, size: 18)
                : const Icon(Icons.visibility_outlined, size: 18),
            label: t.v1ShellNavAuditLog,
            active: currentPath == '$base/admin/audit-logs',
            colors: colors,
            target: '$base/admin/audit-logs',
            onNavigate: onNavigate,
          ),
        ],
      ],
    );
  }
}

class _NavLink {
  final String href;
  final Widget icon;
  final IconData activeIconData;
  final String label;
  final bool auth;

  const _NavLink(
    this.href,
    this.icon,
    this.activeIconData,
    this.label, {
    this.auth = false,
  });

  Icon get activeIcon => Icon(activeIconData, size: 18);
}

class _NavItem extends StatelessWidget {
  final Widget icon;
  final String label;
  final bool active;
  final AppColors colors;
  final String target;
  final VoidCallback? onNavigate;
  const _NavItem({
    required this.icon,
    required this.label,
    required this.active,
    required this.colors,
    required this.target,
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 1),
      child: DecoratedBox(
        decoration: active
            ? BoxDecoration(
                color: colors.brand.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              )
            : const BoxDecoration(),
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: active
              ? null
              : () {
                  onNavigate?.call();
                  context.go(target);
                },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: IconTheme(
                    data: IconThemeData(
                      size: 18,
                      color: active ? colors.brand : colors.fgMuted,
                    ),
                    child: icon,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: active ? FontWeight.w500 : FontWeight.w400,
                    color: active ? colors.brand : colors.fgMuted,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavSectionHeader extends StatelessWidget {
  final AppColors colors;
  final String text;

  const _NavSectionHeader({required this.colors, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: colors.fgMuted.withValues(alpha: 0.6),
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

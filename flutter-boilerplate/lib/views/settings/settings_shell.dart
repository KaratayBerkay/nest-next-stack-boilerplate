import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class SettingsNav extends StatelessWidget {
  final String lang;

  const SettingsNav({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final path = GoRouterState.of(context).matchedLocation;
    final isWide = MediaQuery.of(context).size.width >= 768;

    final tabs = [
      _TabData(
        Icons.settings_outlined,
        Icons.settings,
        t.settingsNavGeneral,
        '/v1/$lang/settings/general',
      ),
      _TabData(
        Icons.person_outline,
        Icons.person,
        t.settingsNavAccount,
        '/v1/$lang/settings/account',
      ),
      _TabData(
        Icons.lock_outline,
        Icons.lock,
        t.settingsNavPrivacy,
        '/v1/$lang/settings/privacy',
      ),
      _TabData(
        Icons.credit_card_outlined,
        Icons.credit_card,
        t.settingsNavBilling,
        '/v1/$lang/settings/billing',
      ),
      _TabData(
        Icons.vpn_key_outlined,
        Icons.vpn_key,
        t.settingsNavApiKeys,
        '/v1/$lang/settings/api-keys',
      ),
      _TabData(
        Icons.devices_outlined,
        Icons.devices,
        t.settingsNavSessions,
        '/v1/$lang/settings/sessions',
      ),
    ];

    if (isWide) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: tabs.map((tab) {
          final active = path == tab.path;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => context.go(tab.path),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: active
                        ? colors.brand.withValues(alpha: 0.1)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        active ? tab.activeIcon : tab.icon,
                        size: 18,
                        color: active ? colors.brand : colors.fgMuted,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        tab.label,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              active ? FontWeight.w600 : FontWeight.normal,
                          color: active ? colors.brand : colors.fg,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: tabs.map((tab) {
            final active = path == tab.path;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () => context.go(tab.path),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: active
                          ? colors.brand.withValues(alpha: 0.1)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          active ? tab.activeIcon : tab.icon,
                          size: 16,
                          color: active ? colors.brand : colors.fgMuted,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight:
                                active ? FontWeight.w600 : FontWeight.normal,
                            color: active ? colors.brand : colors.fg,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class SettingsShellScaffold extends StatelessWidget {
  final String lang;
  final Widget child;

  const SettingsShellScaffold({
    super.key,
    required this.lang,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 768;

    if (isWide) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 220,
            child: Padding(
              padding: const EdgeInsets.only(top: 16, left: 12),
              child: SettingsNav(lang: lang),
            ),
          ),
          const VerticalDivider(width: 1),
          Expanded(child: child),
        ],
      );
    }

    return Column(
      children: [
        SettingsNav(lang: lang),
        const Divider(height: 1),
        Expanded(child: child),
      ],
    );
  }
}

class _TabData {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;

  const _TabData(this.icon, this.activeIcon, this.label, this.path);
}

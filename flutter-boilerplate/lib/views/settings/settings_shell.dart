import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class SettingsNav extends StatefulWidget {
  final String lang;

  const SettingsNav({super.key, required this.lang});

  @override
  State<SettingsNav> createState() => _SettingsNavState();
}

class _SettingsNavState extends State<SettingsNav> {
  final ScrollController _scrollCtrl = ScrollController();
  bool _canScrollLeft = false;
  bool _canScrollRight = false;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_updateScrollAffordance);
    WidgetsBinding.instance
        .addPostFrameCallback((_) => _updateScrollAffordance());
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_updateScrollAffordance);
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _updateScrollAffordance() {
    if (!_scrollCtrl.hasClients) return;
    final position = _scrollCtrl.position;
    final canLeft = position.pixels > position.minScrollExtent + 1;
    final canRight = position.pixels < position.maxScrollExtent - 1;
    if (canLeft != _canScrollLeft || canRight != _canScrollRight) {
      setState(() {
        _canScrollLeft = canLeft;
        _canScrollRight = canRight;
      });
    }
  }

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
        '/v1/${widget.lang}/settings/general',
      ),
      _TabData(
        Icons.person_outline,
        Icons.person,
        t.settingsNavAccount,
        '/v1/${widget.lang}/settings/account',
      ),
      _TabData(
        Icons.lock_outlined,
        Icons.lock,
        t.settingsNavPrivacy,
        '/v1/${widget.lang}/settings/privacy',
      ),
      _TabData(
        Icons.shield_outlined,
        Icons.shield,
        t.settingsNavSecurity,
        '/v1/${widget.lang}/settings/security',
      ),
      _TabData(
        Icons.bar_chart_outlined,
        Icons.bar_chart,
        t.settingsNavUsage,
        '/v1/${widget.lang}/settings/usage',
      ),
      _TabData(
        Icons.credit_card_outlined,
        Icons.credit_card,
        t.settingsNavBilling,
        '/v1/${widget.lang}/settings/billing',
      ),
      _TabData(
        Icons.vpn_key_outlined,
        Icons.vpn_key,
        t.settingsNavApiKeys,
        '/v1/${widget.lang}/settings/api-keys',
      ),
      _TabData(
        Icons.devices_outlined,
        Icons.devices,
        t.settingsNavSessions,
        '/v1/${widget.lang}/settings/sessions',
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
      child: Stack(
        alignment: Alignment.centerRight,
        children: [
          SingleChildScrollView(
            controller: _scrollCtrl,
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
                                fontWeight: active
                                    ? FontWeight.w600
                                    : FontWeight.normal,
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
          if (_canScrollLeft)
            Positioned(
              left: 0,
              child: _ScrollEdgeFade(
                colors: colors,
                icon: Icons.chevron_left,
                alignment: Alignment.centerLeft,
              ),
            ),
          if (_canScrollRight)
            Positioned(
              right: 0,
              child: _ScrollEdgeFade(
                colors: colors,
                icon: Icons.chevron_right,
                alignment: Alignment.centerRight,
              ),
            ),
        ],
      ),
    );
  }
}

class _ScrollEdgeFade extends StatelessWidget {
  final AppColors colors;
  final IconData icon;
  final Alignment alignment;

  const _ScrollEdgeFade({
    required this.colors,
    required this.icon,
    required this.alignment,
  });

  @override
  Widget build(BuildContext context) {
    final isLeft = alignment == Alignment.centerLeft;
    return IgnorePointer(
      child: Container(
        width: 28,
        height: 40,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: isLeft ? Alignment.centerLeft : Alignment.centerRight,
            end: isLeft ? Alignment.centerRight : Alignment.centerLeft,
            colors: [colors.surface, colors.surface.withValues(alpha: 0)],
          ),
        ),
        alignment: alignment,
        child: Icon(icon, size: 18, color: colors.fgMuted),
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

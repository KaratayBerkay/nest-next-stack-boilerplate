import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import 'profile_section.dart';
import 'v1_nav.dart';

class V1Sidebar extends ConsumerWidget {
  final String lang;
  final String currentPath;
  final bool sidebarOpen;
  final VoidCallback onClose;

  const V1Sidebar({
    super.key,
    required this.lang,
    required this.currentPath,
    required this.sidebarOpen,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final user = ref.watch(currentUserProvider);
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 768;

    final sidebarContent = SafeArea(
      top: false,
      child: Container(
        color: colors.surface,
        child: Column(
          children: [
            if (isMobile)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: colors.border)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      t.v1ShellSwipeLeftToClose,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: colors.fgMuted.withValues(alpha: 0.6),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(top: 12, bottom: 16),
                child: V1Nav(
                  lang: lang,
                  currentPath: currentPath,
                  onNavigate: isMobile ? onClose : null,
                ),
              ),
            ),
            if (user != null)
              ProfileSection(
                user: user,
                lang: lang,
                onLogout: () {
                  ref.read(authProvider.notifier).logout();
                  Navigator.of(context)
                      .pushNamedAndRemoveUntil('/auth/login', (_) => true);
                },
              )
            else
              Padding(
                padding: const EdgeInsets.all(16),
                child: InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () => Navigator.of(context)
                      .pushNamedAndRemoveUntil('/auth/login', (_) => true),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: colors.brand,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      t.v1ShellSignIn,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: colors.surface,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );

    if (isMobile) {
      return Stack(
        children: [
          if (sidebarOpen)
            GestureDetector(
              onTap: onClose,
              child: Container(color: Colors.black.withValues(alpha: 0.3)),
            ),
          AnimatedPositioned(
            left: sidebarOpen ? 0 : -width,
            top: 0,
            bottom: 0,
            width: width,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            child: sidebarContent,
          ),
        ],
      );
    }

    return AnimatedContainer(
      width: sidebarOpen ? 224 : 0,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
      clipBehavior: Clip.hardEdge,
      decoration: BoxDecoration(
        border: sidebarOpen
            ? Border(right: BorderSide(color: colors.border))
            : null,
      ),
      child: sidebarContent,
    );
  }
}

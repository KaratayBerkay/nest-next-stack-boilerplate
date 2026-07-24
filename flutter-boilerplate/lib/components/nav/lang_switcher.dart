import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/i18n.dart';
import '../../constants/theme.dart';
import '../../hooks/use_theme.dart';

class LangSwitcher extends ConsumerWidget {
  const LangSwitcher({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final current = ref.watch(localeProvider);

    return PopupMenuButton<String>(
      icon: Text(
        current.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: colors.fgMuted,
        ),
      ),
      onSelected: (lang) {
        ref.read(localeProvider.notifier).setLocale(lang);
      },
      itemBuilder: (_) => I18nConstants.supportedLangs.map((lang) {
        return PopupMenuItem(
          value: lang,
          child: Row(
            children: [
              if (lang == current)
                Icon(Icons.circle, size: 8, color: colors.brand)
              else
                const SizedBox(width: 8),
              const SizedBox(width: 8),
              Text(lang.toUpperCase()),
            ],
          ),
        );
      }).toList(),
    );
  }
}

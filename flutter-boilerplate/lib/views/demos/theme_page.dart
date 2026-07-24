// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../hooks/use_theme.dart';

class ThemeDemoPage extends ConsumerWidget {
  final String lang;

  const ThemeDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMode = ref.watch(themeModeProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Theme Demo')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Current theme: ${currentMode.name}',
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 16),
          ...AppThemeMode.values.map(
            (mode) => RadioListTile<AppThemeMode>(
              title: Text(mode.name),
              value: mode,
              groupValue: currentMode,
              onChanged: (v) {
                if (v != null) {
                  ref.read(themeModeProvider.notifier).setMode(v);
                }
              },
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Color Tokens',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          _tokenRow('Brand', AppColors.of(context).brand),
          _tokenRow('Surface', AppColors.of(context).surface),
          _tokenRow('Surface Alt', AppColors.of(context).surfaceAlt),
          _tokenRow('Foreground', AppColors.of(context).fg),
          _tokenRow('Fg Muted', AppColors.of(context).fgMuted),
          _tokenRow('Border', AppColors.of(context).border),
          _tokenRow('Danger', AppColors.of(context).danger),
          _tokenRow('Success', AppColors.of(context).success),
        ],
      ),
    );
  }

  Widget _tokenRow(String label, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: Colors.grey.shade300),
            ),
          ),
          const SizedBox(width: 12),
          Text(label),
          const Spacer(),
          Text(
            color.toARGB32().toRadixString(16).padLeft(8, '0'),
            style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
          ),
        ],
      ),
    );
  }
}

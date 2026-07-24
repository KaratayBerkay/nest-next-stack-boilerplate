import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class SettingsSelect extends StatelessWidget {
  final String label;
  final String? subtitle;
  final String value;
  final List<String> items;
  final ValueChanged<String> onChanged;
  final IconData? leadingIcon;

  const SettingsSelect({
    super.key,
    required this.label,
    this.subtitle,
    required this.value,
    required this.items,
    required this.onChanged,
    this.leadingIcon,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return ListTile(
      leading:
          leadingIcon != null ? Icon(leadingIcon, color: colors.brand) : null,
      title: Text(label),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: TextStyle(color: colors.fgMuted, fontSize: 12),
            )
          : null,
      trailing: DropdownButton<String>(
        value: value,
        items: items
            .map(
              (item) => DropdownMenuItem<String>(
                value: item,
                child: Text(item.toUpperCase()),
              ),
            )
            .toList(),
        onChanged: (v) {
          if (v != null) onChanged(v);
        },
        underline: const SizedBox(),
      ),
    );
  }
}

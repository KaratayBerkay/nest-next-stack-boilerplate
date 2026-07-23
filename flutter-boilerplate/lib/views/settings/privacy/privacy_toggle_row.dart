import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class PrivacyToggleRow extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool showDivider;

  const PrivacyToggleRow({
    super.key,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      children: [
        SwitchListTile(
          title: Text(title),
          subtitle: Text(subtitle, style: TextStyle(color: colors.fgMuted, fontSize: 12)),
          value: value,
          onChanged: onChanged,
        ),
        if (showDivider) const Divider(height: 1),
      ],
    );
  }
}

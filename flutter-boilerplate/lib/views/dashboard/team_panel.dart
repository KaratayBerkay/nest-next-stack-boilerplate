import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class TeamPanel extends StatelessWidget {
  const TeamPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Team',
            style: TextStyle(
              color: colors.brand,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Rendered by the team slot.',
            style: TextStyle(color: colors.fgMuted, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

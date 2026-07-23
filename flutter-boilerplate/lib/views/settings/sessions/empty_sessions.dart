import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class EmptySessions extends StatelessWidget {
  final String? message;

  const EmptySessions({
    super.key,
    this.message,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.devices_outlined, size: 48, color: colors.fgMuted),
          const SizedBox(height: 16),
          Text(
            message ?? 'No active sessions',
            style: TextStyle(color: colors.fgMuted, fontSize: 16),
          ),
        ],
      ),
    );
  }
}

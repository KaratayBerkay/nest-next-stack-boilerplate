import 'package:flutter/material.dart';

class UsersListFallback extends StatelessWidget {
  const UsersListFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Loading users...',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.5),
        fontSize: 13,
      ),
    );
  }
}

import 'package:flutter/material.dart';

class LoadingPage extends StatelessWidget {
  final String text;

  const LoadingPage({super.key, this.text = 'Loading...'});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Center(
      child: Text(
        text,
        style: TextStyle(
          color: colors.onSurface.withValues(alpha: 0.5),
          fontSize: 13,
        ),
      ),
    );
  }
}

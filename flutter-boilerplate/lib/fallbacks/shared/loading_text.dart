import 'package:flutter/material.dart';

class LoadingTextFallback extends StatelessWidget {
  final String text;

  const LoadingTextFallback({super.key, this.text = 'Loading...'});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        text,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
        ),
      ),
    );
  }
}

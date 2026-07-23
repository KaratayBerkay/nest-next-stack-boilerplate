import 'package:flutter/material.dart';

class LoadingDotsFallback extends StatelessWidget {
  const LoadingDotsFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
    );
  }
}

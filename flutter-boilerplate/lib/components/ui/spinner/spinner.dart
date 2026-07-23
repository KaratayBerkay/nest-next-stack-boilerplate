import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class Spinner extends StatelessWidget {
  final double size;
  final Color? color;

  const Spinner({super.key, this.size = 24, this.color});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Center(
      child: SizedBox(
        width: size,
        height: size,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation<Color>(color ?? colors.brand),
        ),
      ),
    );
  }
}

class LogoSpinner extends StatelessWidget {
  final double size;

  const LogoSpinner({super.key, this.size = 48});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.flutter_dash, size: size, color: colors.brand),
          const SizedBox(height: 16),
          SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(colors.brand),
            ),
          ),
        ],
      ),
    );
  }
}

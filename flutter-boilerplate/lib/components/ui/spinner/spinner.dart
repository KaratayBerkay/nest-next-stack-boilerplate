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

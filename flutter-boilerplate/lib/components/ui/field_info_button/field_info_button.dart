import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../tooltip/tooltip.dart';

class FieldInfoButton extends StatelessWidget {
  final String description;

  const FieldInfoButton({
    super.key,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final btn = GestureDetector(
      onTap: () {},
      child: Icon(Icons.info_outline, size: 14, color: colors.fgMuted),
    );

    return TooltipWidget(
      message: description,
      child: btn,
    );
  }
}

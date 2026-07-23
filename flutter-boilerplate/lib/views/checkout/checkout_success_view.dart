import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class CheckoutSuccessView extends StatelessWidget {
  final bool isDowngrade;
  final String downgradeMsg;
  final String upgradeMsg;
  final String redirectingMsg;

  const CheckoutSuccessView({
    super.key,
    required this.isDowngrade,
    required this.downgradeMsg,
    required this.upgradeMsg,
    required this.redirectingMsg,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isDowngrade ? Icons.arrow_downward : Icons.check_circle,
              size: 48,
              color: isDowngrade ? colors.warning : Colors.green,
            ),
            const SizedBox(height: 16),
            Text(
              isDowngrade ? downgradeMsg : upgradeMsg,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: isDowngrade ? colors.warning : Colors.green,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              redirectingMsg,
              style: TextStyle(
                fontSize: 14,
                color: colors.fgMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

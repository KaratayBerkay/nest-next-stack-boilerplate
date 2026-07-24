import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

Map<String, dynamic> collectBillingData({
  required TextEditingController cardCtrl,
  required TextEditingController expiryCtrl,
  required TextEditingController cvcCtrl,
}) {
  return {
    'cardNumber': cardCtrl.text,
    'expiry': expiryCtrl.text,
    'cvc': cvcCtrl.text,
  };
}

bool validateBillingForm(GlobalKey<FormState> formKey) {
  return formKey.currentState?.validate() ?? false;
}

void showBillingSuccess(BuildContext context) {
  final colors = AppColors.of(context);
  final t = AppLocalizations.of(context);
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          Icon(Icons.check_circle, color: colors.success, size: 18),
          const SizedBox(width: 8),
          Text(t.formsBillingSaveSuccess),
        ],
      ),
    ),
  );
}

void showBillingError(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          const Icon(Icons.error_outline, size: 18),
          const SizedBox(width: 8),
          Text(message),
        ],
      ),
    ),
  );
}

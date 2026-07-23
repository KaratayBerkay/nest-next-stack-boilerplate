import 'package:flutter/material.dart' hide Badge;
import 'package:go_router/go_router.dart';

import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class PaymentMethod {
  final String id;
  final String brand;
  final String last4;
  final int expMonth;
  final int expYear;
  final bool isDefault;

  const PaymentMethod({
    required this.id,
    required this.brand,
    required this.last4,
    required this.expMonth,
    required this.expYear,
    this.isDefault = false,
  });
}

class PaymentMethods extends StatelessWidget {
  final List<PaymentMethod> methods;
  final String lang;
  final Future<void> Function(String id)? onRemove;
  final Future<void> Function(String id)? onSetDefault;

  const PaymentMethods({
    super.key,
    required this.methods,
    required this.lang,
    this.onRemove,
    this.onSetDefault,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (methods.isEmpty) {
      return Column(
        children: [
          Text('No payment methods saved.', style: TextStyle(color: colors.fgMuted)),
          const SizedBox(height: 8),
          Button(
            variant: ButtonVariant.outline,
            child: const Text('Add Card'),
            onPressed: () => context.go('/v1/$lang/plans'),
          ),
        ],
      );
    }

    return Column(
      children: methods.map((pm) => ListTile(
        leading: Icon(Icons.credit_card, color: colors.brand),
        title: Text('${pm.brand} •••• ${pm.last4}'),
        subtitle: Text('Expires ${pm.expMonth}/${pm.expYear}'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (pm.isDefault)
              const Badge(text: 'Default', variant: BadgeVariant.success),
            if (!pm.isDefault && onSetDefault != null)
              TextButton(
                onPressed: () => onSetDefault!(pm.id),
                child: const Text('Set Default', style: TextStyle(fontSize: 12)),
              ),
            if (onRemove != null)
              IconButton(
                icon: const Icon(Icons.delete_outline, size: 18),
                onPressed: () => onRemove!(pm.id),
              ),
          ],
        ),
      ),).toList(),
    );
  }
}

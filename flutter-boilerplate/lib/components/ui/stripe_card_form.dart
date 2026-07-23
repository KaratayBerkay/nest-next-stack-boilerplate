import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import '../../constants/theme.dart';

class StripeCardFormField extends StatefulWidget {
  final void Function(bool complete)? onCompletionChanged;
  final TextEditingController? nameController;

  const StripeCardFormField({
    super.key,
    this.onCompletionChanged,
    this.nameController,
  });

  @override
  State<StripeCardFormField> createState() => _StripeCardFormFieldState();
}

class _StripeCardFormFieldState extends State<StripeCardFormField> {
  bool _complete = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.nameController != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TextField(
              controller: widget.nameController,
              decoration: InputDecoration(
                labelText: 'Cardholder name',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: colors.border),
                ),
              ),
            ),
          ),
        CardField(
          onCardChanged: (details) {
            final complete = details?.complete ?? false;
            setState(() => _complete = complete);
            widget.onCompletionChanged?.call(complete);
          },
        ),
        if (!_complete)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              'Enter your card details',
              style: TextStyle(fontSize: 12, color: colors.fgMuted),
            ),
          ),
      ],
    );
  }
}

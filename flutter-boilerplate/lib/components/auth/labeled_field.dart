import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../constants/theme.dart';
import '../ui/input/input.dart';

class LabeledField extends StatefulWidget {
  final String label;
  final bool required;
  final String? hint;
  final String? errorText;
  final TextEditingController? controller;
  final bool obscureText;
  final bool showVisibilityToggle;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final VoidCallback? onSubmitted;
  final bool autofocus;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;
  final void Function(String)? onChanged;

  const LabeledField({
    super.key,
    required this.label,
    this.required = false,
    this.hint,
    this.errorText,
    this.controller,
    this.obscureText = false,
    this.showVisibilityToggle = false,
    this.keyboardType,
    this.textInputAction,
    this.onSubmitted,
    this.autofocus = false,
    this.maxLength,
    this.inputFormatters,
    this.onChanged,
  });

  @override
  State<LabeledField> createState() => _LabeledFieldState();
}

class _LabeledFieldState extends State<LabeledField> {
  late bool _obscured = widget.obscureText;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final theme = Theme.of(context);
    final effectiveObscure =
        widget.showVisibilityToggle ? _obscured : widget.obscureText;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Text(
              widget.label,
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: colors.fg,
              ),
            ),
            if (widget.required)
              Text(
                ' *',
                style: TextStyle(color: colors.danger, fontSize: 14),
              ),
          ],
        ),
        const SizedBox(height: 6),
        Input(
          controller: widget.controller,
          hintText: widget.hint,
          errorText: widget.errorText,
          obscureText: effectiveObscure,
          suffixIcon: widget.showVisibilityToggle
              ? IconButton(
                  icon: Icon(
                    _obscured
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                  onPressed: () => setState(() => _obscured = !_obscured),
                )
              : null,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          onSubmitted: widget.onSubmitted,
          autofocus: widget.autofocus,
          maxLength: widget.maxLength,
          inputFormatters: widget.inputFormatters,
          onChanged: widget.onChanged,
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DateInput extends ConsumerWidget {
  final DateTime? value;
  final void Function(DateTime)? onChanged;
  final String? label;

  const DateInput({
    super.key,
    this.value,
    this.onChanged,
    this.label,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: value ?? DateTime.now(),
          firstDate: DateTime(1900),
          lastDate: DateTime(2100),
        );
        if (date != null) onChanged?.call(date);
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          suffixIcon: const Icon(Icons.calendar_today),
        ),
        child: Text(
          value != null
              ? '${value!.year}-${value!.month.toString().padLeft(2, '0')}-${value!.day.toString().padLeft(2, '0')}'
              : 'Select date',
        ),
      ),
    );
  }
}

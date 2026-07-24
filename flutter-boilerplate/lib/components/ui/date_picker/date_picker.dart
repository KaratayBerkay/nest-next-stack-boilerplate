import 'package:flutter/material.dart';

class DatePickerField extends StatelessWidget {
  final DateTime? value;
  final void Function(DateTime)? onChanged;
  final String? label;
  final String? hintText;
  final DateTime? firstDate;
  final DateTime? lastDate;

  const DatePickerField({
    super.key,
    this.value,
    this.onChanged,
    this.label,
    this.hintText,
    this.firstDate,
    this.lastDate,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      readOnly: true,
      controller: TextEditingController(
        text: value != null
            ? '${value!.year}-${value!.month.toString().padLeft(2, '0')}-${value!.day.toString().padLeft(2, '0')}'
            : '',
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText ?? 'Select date',
        suffixIcon: const Icon(Icons.calendar_today, size: 18),
      ),
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: value ?? DateTime.now(),
          firstDate: firstDate ?? DateTime(2000),
          lastDate: lastDate ?? DateTime(2100),
        );
        if (picked != null) {
          onChanged?.call(picked);
        }
      },
    );
  }
}

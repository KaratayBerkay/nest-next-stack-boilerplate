import 'package:flutter/material.dart';

class TimeInput extends StatelessWidget {
  final TimeOfDay? value;
  final void Function(TimeOfDay)? onChanged;
  final String? label;
  final String? hintText;

  const TimeInput({
    super.key,
    this.value,
    this.onChanged,
    this.label,
    this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      readOnly: true,
      controller: TextEditingController(
        text: value != null
            ? '${value!.hour.toString().padLeft(2, '0')}:${value!.minute.toString().padLeft(2, '0')}'
            : '',
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText ?? 'Select time',
        suffixIcon: const Icon(Icons.access_time, size: 18),
      ),
      onTap: () async {
        final picked = await showTimePicker(
          context: context,
          initialTime: value ?? TimeOfDay.now(),
        );
        if (picked != null) {
          onChanged?.call(picked);
        }
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DateTimeInput extends ConsumerWidget {
  final DateTime? value;
  final void Function(DateTime)? onChanged;
  final String? label;

  const DateTimeInput({
    super.key,
    this.value,
    this.onChanged,
    this.label,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Row(
      children: [
        Expanded(
          child: InkWell(
            onTap: () async {
              final date = await showDatePicker(
                context: context,
                initialDate: value ?? DateTime.now(),
                firstDate: DateTime(1900),
                lastDate: DateTime(2100),
              );
              if (date != null && onChanged != null) {
                final existing = value ?? DateTime.now();
                onChanged!(DateTime(
                  date.year,
                  date.month,
                  date.day,
                  existing.hour,
                  existing.minute,
                ));
              }
            },
            child: InputDecorator(
              decoration: InputDecoration(labelText: label ?? 'Date'),
              child: Text(
                value != null
                    ? '${value!.year}-${value!.month.toString().padLeft(2, '0')}-${value!.day.toString().padLeft(2, '0')}'
                    : 'Select',
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: InkWell(
            onTap: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: value != null
                    ? TimeOfDay.fromDateTime(value!)
                    : TimeOfDay.now(),
              );
              if (time != null && onChanged != null) {
                final existing = value ?? DateTime.now();
                onChanged!(DateTime(
                  existing.year,
                  existing.month,
                  existing.day,
                  time.hour,
                  time.minute,
                ));
              }
            },
            child: InputDecorator(
              decoration: const InputDecoration(labelText: 'Time'),
              child: Text(
                value != null
                    ? '${value!.hour.toString().padLeft(2, '0')}:${value!.minute.toString().padLeft(2, '0')}'
                    : 'Select',
              ),
            ),
          ),
        ),
      ],
    );
  }
}

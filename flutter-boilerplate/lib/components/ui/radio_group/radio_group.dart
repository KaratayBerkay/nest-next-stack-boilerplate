import 'package:flutter/material.dart';

class RadioGroupWidget extends StatelessWidget {
  final String? groupValue;
  final List<String> options;
  final void Function(String?)? onChanged;

  const RadioGroupWidget({
    super.key,
    this.groupValue,
    required this.options,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return RadioGroup<String>(
      groupValue: groupValue,
      onChanged: (value) => onChanged?.call(value),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: options.map((option) {
          return RadioListTile<String>(
            title: Text(option),
            value: option,
            dense: true,
            controlAffinity: ListTileControlAffinity.leading,
          );
        }).toList(),
      ),
    );
  }
}

import 'package:flutter/material.dart';

class RadioGroup extends StatelessWidget {
  final String? groupValue;
  final List<String> options;
  final void Function(String?)? onChanged;

  const RadioGroup({
    super.key,
    this.groupValue,
    required this.options,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: options.map((option) {
        return RadioListTile<String>(
          title: Text(option),
          value: option,
          groupValue: groupValue,
          onChanged: onChanged,
          dense: true,
          controlAffinity: ListTileControlAffinity.leading,
        );
      }).toList(),
    );
  }
}

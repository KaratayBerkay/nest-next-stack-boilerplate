import 'package:flutter/material.dart';

class NativeSelect extends StatelessWidget {
  final String? value;
  final List<String> items;
  final void Function(String?)? onChanged;
  final String? label;
  final String? hintText;
  final String? errorText;

  const NativeSelect({
    super.key,
    this.value,
    required this.items,
    this.onChanged,
    this.label,
    this.hintText,
    this.errorText,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        errorText: errorText,
      ),
      items: items.map((item) {
        return DropdownMenuItem(value: item, child: Text(item));
      }).toList(),
      onChanged: onChanged,
    );
  }
}

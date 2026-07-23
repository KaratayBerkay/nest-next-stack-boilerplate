import 'package:flutter/material.dart';


class DropdownWidget extends StatelessWidget {
  final String? value;
  final List<DropdownMenuItem<String>> items;
  final void Function(String?)? onChanged;
  final String? label;
  final String? hint;
  final Widget? icon;

  const DropdownWidget({
    super.key,
    this.value,
    required this.items,
    this.onChanged,
    this.label,
    this.hint,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: icon,
      ),
      items: items,
      onChanged: onChanged,
      isExpanded: true,
    );
  }
}

class DropdownMenuWidget extends StatelessWidget {
  final String? value;
  final List<String> items;
  final void Function(String?)? onChanged;
  final String? label;

  const DropdownMenuWidget({
    super.key,
    this.value,
    required this.items,
    this.onChanged,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownMenu<String>(
      label: label != null ? Text(label!) : null,
      initialSelection: value,
      onSelected: onChanged,
      dropdownMenuEntries: items.map((item) {
        return DropdownMenuEntry(value: item, label: item);
      }).toList(),
    );
  }
}

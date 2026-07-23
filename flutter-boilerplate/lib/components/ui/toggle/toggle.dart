import 'package:flutter/material.dart';

class ToggleSwitch extends StatelessWidget {
  final bool value;
  final void Function(bool)? onChanged;
  final String? label;

  const ToggleSwitch({
    super.key,
    required this.value,
    this.onChanged,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    if (label != null) {
      return SwitchListTile(
        title: Text(label!),
        value: value,
        onChanged: onChanged,
      );
    }
    return Switch(
      value: value,
      onChanged: onChanged,
    );
  }
}

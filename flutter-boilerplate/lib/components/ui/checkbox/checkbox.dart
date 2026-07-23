import 'package:flutter/material.dart';

class CheckboxWidget extends StatelessWidget {
  final bool value;
  final void Function(bool)? onChanged;
  final String? label;
  final bool tristate;

  const CheckboxWidget({
    super.key,
    required this.value,
    this.onChanged,
    this.label,
    this.tristate = false,
  });

  @override
  Widget build(BuildContext context) {
    if (label != null) {
      return CheckboxListTile(
        title: Text(label!),
        value: value,
        onChanged: onChanged != null ? (v) => onChanged!(v ?? false) : null,
        controlAffinity: ListTileControlAffinity.leading,
        dense: true,
      );
    }
    return Checkbox(
      value: value,
      onChanged: onChanged != null ? (v) => onChanged!(v ?? false) : null,
      tristate: tristate,
    );
  }
}

class CheckboxGroup extends StatelessWidget {
  final List<String> options;
  final List<String> selected;
  final void Function(List<String>)? onChanged;

  const CheckboxGroup({
    super.key,
    required this.options,
    required this.selected,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: options.map((option) {
        final isSelected = selected.contains(option);
        return CheckboxListTile(
          title: Text(option),
          value: isSelected,
          onChanged: (v) {
            if (onChanged == null) return;
            if (v == true) {
              onChanged!([...selected, option]);
            } else {
              onChanged!(selected.where((s) => s != option).toList());
            }
          },
          dense: true,
          controlAffinity: ListTileControlAffinity.leading,
        );
      }).toList(),
    );
  }
}

class CheckboxCard extends StatelessWidget {
  final bool value;
  final void Function(bool)? onChanged;
  final Widget child;

  const CheckboxCard({
    super.key,
    required this.value,
    this.onChanged,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: () => onChanged?.call(!value),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Checkbox(value: value, onChanged: (v) => onChanged?.call(v ?? false)),
              const SizedBox(width: 8),
              Expanded(child: child),
            ],
          ),
        ),
      ),
    );
  }
}

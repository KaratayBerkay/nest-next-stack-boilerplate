import 'package:flutter/material.dart';

class ToggleGroup extends StatelessWidget {
  final List<String> options;
  final List<int> selectedIndexes;
  final void Function(List<int>)? onChanged;
  final bool multiple;

  const ToggleGroup({
    super.key,
    required this.options,
    required this.selectedIndexes,
    this.onChanged,
    this.multiple = false,
  });

  @override
  Widget build(BuildContext context) {
    return ToggleButtons(
      isSelected:
          List.generate(options.length, (i) => selectedIndexes.contains(i)),
      onPressed: (index) {
        if (multiple) {
          if (selectedIndexes.contains(index)) {
            onChanged?.call(selectedIndexes.where((i) => i != index).toList());
          } else {
            onChanged?.call([...selectedIndexes, index]);
          }
        } else {
          onChanged?.call([index]);
        }
      },
      children: options.map((option) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(option),
        );
      }).toList(),
    );
  }
}

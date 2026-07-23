import 'package:flutter/material.dart';

class SliderWidget extends StatelessWidget {
  final double value;
  final void Function(double)? onChanged;
  final double min;
  final double max;
  final int? divisions;
  final String? label;

  const SliderWidget({
    super.key,
    required this.value,
    this.onChanged,
    this.min = 0,
    this.max = 100,
    this.divisions,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    if (label != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label!, style: const TextStyle(fontWeight: FontWeight.w500)),
          Slider(
            value: value,
            onChanged: onChanged,
            min: min,
            max: max,
            divisions: divisions,
          ),
        ],
      );
    }
    return Slider(
      value: value,
      onChanged: onChanged,
      min: min,
      max: max,
      divisions: divisions,
    );
  }
}

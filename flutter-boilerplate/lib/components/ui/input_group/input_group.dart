import 'package:flutter/material.dart';

class InputGroup extends StatelessWidget {
  final List<Widget> children;
  final String? label;
  final Widget? prefix;
  final Widget? suffix;
  final Axis direction;

  const InputGroup({
    super.key,
    required this.children,
    this.label,
    this.prefix,
    this.suffix,
    this.direction = Axis.horizontal,
  });

  @override
  Widget build(BuildContext context) {
    final input = Row(
      children: [
        if (prefix != null) prefix!,
        if (prefix != null) const SizedBox(width: 4),
        ...children,
        if (suffix != null) const SizedBox(width: 4),
        if (suffix != null) suffix!,
      ],
    );

    if (label != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label!, style: const TextStyle(fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          direction == Axis.horizontal ? input : Column(children: children),
        ],
      );
    }

    return direction == Axis.horizontal ? input : Column(children: children);
  }
}

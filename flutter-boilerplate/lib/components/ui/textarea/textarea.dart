import 'package:flutter/material.dart';

class Textarea extends StatelessWidget {
  final String? label;
  final String? hintText;
  final String? errorText;
  final TextEditingController? controller;
  final int minLines;
  final int? maxLines;
  final void Function(String)? onChanged;

  const Textarea({
    super.key,
    this.label,
    this.hintText,
    this.errorText,
    this.controller,
    this.minLines = 3,
    this.maxLines,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      minLines: minLines,
      maxLines: maxLines ?? minLines,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        errorText: errorText,
        alignLabelWithHint: true,
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../../components/ui/select/select.dart';

class SelectsSection extends StatefulWidget {
  const SelectsSection({super.key});

  @override
  State<SelectsSection> createState() => _SelectsSectionState();
}

class _SelectsSectionState extends State<SelectsSection> {
  String? _simple;
  String? _withLabel;
  String? _withError;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SelectWidget(
          label: 'Simple Select',
          hintText: 'Choose an option',
          items: const ['Option A', 'Option B', 'Option C'],
          value: _simple,
          onChanged: (v) => setState(() => _simple = v),
        ),
        const SizedBox(height: 8),
        SelectWidget(
          label: 'With Label',
          items: const ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
          value: _withLabel,
          onChanged: (v) => setState(() => _withLabel = v),
        ),
        const SizedBox(height: 8),
        SelectWidget(
          label: 'With Error',
          hintText: 'Select a value',
          items: const ['Red', 'Green', 'Blue'],
          value: _withError,
          errorText: 'Please select a color',
          onChanged: (v) => setState(() => _withError = v),
        ),
      ],
    );
  }
}

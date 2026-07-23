import 'package:flutter/material.dart';

import '../../../components/ui/checkbox/checkbox.dart';
import '../../../components/ui/switch/switch.dart';

class TogglesSection extends StatefulWidget {
  const TogglesSection({super.key});

  @override
  State<TogglesSection> createState() => _TogglesSectionState();
}

class _TogglesSectionState extends State<TogglesSection> {
  bool _checkbox1 = false;
  bool _checkbox2 = true;
  bool _checkbox3 = false;
  bool _switch1 = true;
  bool _switch2 = false;
  List<String> _selected = ['Option 1'];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CheckboxWidget(
          value: _checkbox1,
          label: 'Accept terms and conditions',
          onChanged: (v) => setState(() => _checkbox1 = v),
        ),
        CheckboxWidget(
          value: _checkbox2,
          label: 'Subscribe to newsletter',
          onChanged: (v) => setState(() => _checkbox2 = v),
        ),
        CheckboxWidget(
          value: _checkbox3,
          label: 'Remember me',
          onChanged: (v) => setState(() => _checkbox3 = v),
        ),
        const SizedBox(height: 12),
        CheckboxGroup(
          options: const ['Option 1', 'Option 2', 'Option 3'],
          selected: _selected,
          onChanged: (v) => setState(() => _selected = v),
        ),
        const SizedBox(height: 12),
        SwitchWidget(
          value: _switch1,
          label: 'Enable notifications',
          onChanged: (v) => setState(() => _switch1 = v),
        ),
        SwitchWidget(
          value: _switch2,
          label: 'Dark mode',
          onChanged: (v) => setState(() => _switch2 = v),
        ),
      ],
    );
  }
}

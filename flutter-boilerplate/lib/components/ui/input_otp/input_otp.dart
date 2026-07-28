import 'package:flutter/material.dart';

class InputOtp extends StatefulWidget {
  final int length;
  final String? value;
  final void Function(String)? onChanged;
  final void Function(String)? onCompleted;
  final double spacing;

  const InputOtp({
    super.key,
    this.length = 6,
    this.value,
    this.onChanged,
    this.onCompleted,
    this.spacing = 8,
  });

  @override
  State<InputOtp> createState() => _InputOtpState();
}

class _InputOtpState extends State<InputOtp> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _initControllers();
  }

  void _initControllers() {
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
    _syncFromValue();
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant InputOtp old) {
    super.didUpdateWidget(old);
    if (widget.value != old.value) {
      _syncFromValue();
    }
  }

  void _syncFromValue() {
    final v = widget.value ?? '';
    for (int i = 0; i < widget.length; i++) {
      final char = i < v.length ? v[i] : '';
      if (_controllers[i].text != char) {
        _controllers[i].text = char;
      }
    }
  }

  String get _fullValue => _controllers.map((c) => c.text).join();

  void _onChanged(String value, int index) {
    if (value.isNotEmpty && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    final full = _fullValue;
    widget.onChanged?.call(full);
    if (full.length == widget.length) {
      widget.onCompleted?.call(full);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(widget.length, (i) {
        return Padding(
          padding: EdgeInsets.only(
            right: i < widget.length - 1 ? widget.spacing : 0,
          ),
          child: SizedBox(
            width: 40,
            child: TextField(
              controller: _controllers[i],
              focusNode: _focusNodes[i],
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              maxLength: 1,
              decoration: const InputDecoration(
                counterText: '',
                border: OutlineInputBorder(),
              ),
              onChanged: (v) => _onChanged(v, i),
            ),
          ),
        );
      }),
    );
  }
}

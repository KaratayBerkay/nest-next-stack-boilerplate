import 'package:flutter/material.dart';

class InputOtp extends StatefulWidget {
  final int length;
  final void Function(String)? onCompleted;
  final double spacing;

  const InputOtp({
    super.key,
    this.length = 6,
    this.onCompleted,
    this.spacing = 8,
  });

  @override
  State<InputOtp> createState() => _InputOtpState();
}

class _InputOtpState extends State<InputOtp> {
  final List<TextEditingController> _controllers = [];
  final List<FocusNode> _focusNodes = [];

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < widget.length; i++) {
      _controllers.add(TextEditingController());
      _focusNodes.add(FocusNode());
    }
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

  void _onChanged(String value, int index) {
    if (value.isNotEmpty && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    if (_controllers.every((c) => c.text.isNotEmpty)) {
      widget.onCompleted?.call(_controllers.map((c) => c.text).join());
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

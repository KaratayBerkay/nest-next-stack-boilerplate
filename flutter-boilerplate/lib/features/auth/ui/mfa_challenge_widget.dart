import 'dart:async';

import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/input/input.dart';
import '../../../constants/theme.dart';

class MfaChallengeWidget extends StatefulWidget {
  final void Function(String code)? onCodeChanged;
  final VoidCallback? onResend;
  final int resendCooldownSeconds;
  final bool isResending;

  const MfaChallengeWidget({
    super.key,
    this.onCodeChanged,
    this.onResend,
    this.resendCooldownSeconds = 30,
    this.isResending = false,
  });

  @override
  State<MfaChallengeWidget> createState() => _MfaChallengeWidgetState();
}

class _MfaChallengeWidgetState extends State<MfaChallengeWidget> {
  int _remainingSeconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.resendCooldownSeconds;
    _startTimer();
  }

  @override
  void didUpdateWidget(MfaChallengeWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.resendCooldownSeconds != oldWidget.resendCooldownSeconds) {
      _remainingSeconds = widget.resendCooldownSeconds;
      _resetTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    if (_remainingSeconds <= 0) return;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_remainingSeconds <= 1) {
        _timer?.cancel();
        if (mounted) setState(() => _remainingSeconds = 0);
      } else {
        if (mounted) setState(() => _remainingSeconds--);
      }
    });
  }

  void _resetTimer() {
    _timer?.cancel();
    _startTimer();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);
    final canResend = _remainingSeconds <= 0 && !widget.isResending;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'Enter the verification code',
          style: typography.body.copyWith(color: colors.fgMuted),
        ),
        const SizedBox(height: 16),
        Input(
          keyboardType: TextInputType.number,
          onChanged: widget.onCodeChanged,
          hintText: '000000',
        ),
        const SizedBox(height: 20),
        if (_remainingSeconds > 0)
          Text(
            'Resend in $_remainingSeconds s',
            style: typography.caption.copyWith(color: colors.fgMuted),
          )
        else
          Button(
            variant: ButtonVariant.ghost,
            loading: widget.isResending,
            onPressed: canResend
                ? () {
                    widget.onResend?.call();
                    setState(() => _remainingSeconds = widget.resendCooldownSeconds);
                    _resetTimer();
                  }
                : null,
            child: const Text('Resend code'),
          ),
      ],
    );
  }
}

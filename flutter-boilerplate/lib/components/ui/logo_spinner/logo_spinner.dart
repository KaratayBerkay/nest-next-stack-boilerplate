import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class LogoSpinner extends StatefulWidget {
  final double size;

  const LogoSpinner({super.key, this.size = 48});

  @override
  State<LogoSpinner> createState() => _LogoSpinnerState();
}

class _LogoSpinnerState extends State<LogoSpinner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) => Opacity(
              opacity: _pulseAnimation.value,
              child: child,
            ),
            child: _buildLogo(colors),
          ),
          const SizedBox(height: 24),
          _buildBouncingDots(colors),
        ],
      ),
    );
  }

  Widget _buildLogo(AppColors colors) {
    final s = widget.size;
    return SizedBox(
      width: s,
      height: s,
      child: CustomPaint(
        painter: _LogoPainter(colors.brand),
      ),
    );
  }

  Widget _buildBouncingDots(AppColors colors) {
    return SizedBox(
      height: 12,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _animatedDot(colors.brand, 0),
          const SizedBox(width: 6),
          _animatedDot(colors.brand, 150),
          const SizedBox(width: 6),
          _animatedDot(colors.brand, 300),
        ],
      ),
    );
  }

  Widget _animatedDot(Color color, int delayMs) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        final phase = (_pulseController.value + delayMs / 1500) % 1.0;
        final bounce = (1 - (phase * 4 - 1).abs().clamp(0.0, 1.0)) * 0.5 + 0.5;
        return Transform.translate(
          offset: Offset(0, -4 * (1 - bounce)),
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }
}

class _LogoPainter extends CustomPainter {
  final Color color;

  _LogoPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final outer = RRect.fromRectAndRadius(
      Offset.zero & size,
      Radius.circular(size.width * 0.2),
    );

    final paint15 = Paint()..color = color.withValues(alpha: 0.15);
    canvas.drawRRect(outer, paint15);

    final inset1 = size.width * 0.125;
    final mid = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        inset1,
        inset1,
        size.width - inset1 * 2,
        size.height - inset1 * 2,
      ),
      Radius.circular(size.width * 0.14),
    );
    final paint30 = Paint()..color = color.withValues(alpha: 0.3);
    canvas.drawRRect(mid, paint30);

    final inset2 = size.width * 0.25;
    final inner = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        inset2,
        inset2,
        size.width - inset2 * 2,
        size.height - inset2 * 2,
      ),
      Radius.circular(size.width * 0.08),
    );
    final paintFull = Paint()..color = color;
    canvas.drawRRect(inner, paintFull);
  }

  @override
  bool shouldRepaint(_LogoPainter oldDelegate) => oldDelegate.color != color;
}

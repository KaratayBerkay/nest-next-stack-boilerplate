import 'package:flutter/material.dart';

class MonoEllipsisFallback extends StatefulWidget {
  const MonoEllipsisFallback({super.key});

  @override
  State<MonoEllipsisFallback> createState() => _MonoEllipsisFallbackState();
}

class _MonoEllipsisFallbackState extends State<MonoEllipsisFallback>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        final dots = '.' * ((_controller.value * 6).floor() % 4);
        return Center(
          child: Text(
            dots,
            style: const TextStyle(fontSize: 24, fontFamily: 'monospace'),
          ),
        );
      },
    );
  }
}

import 'package:flutter/material.dart';

class ToastProvider extends StatefulWidget {
  final Widget child;

  const ToastProvider({super.key, required this.child});

  @override
  State<ToastProvider> createState() => _ToastProviderState();

  static _ToastProviderState? of(BuildContext context) {
    return context.findAncestorStateOfType<_ToastProviderState>();
  }
}

class _ToastProviderState extends State<ToastProvider> {
  final GlobalKey<ScaffoldMessengerState> _scaffoldMessengerKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      scaffoldMessengerKey: _scaffoldMessengerKey,
      home: widget.child,
    );
  }
}

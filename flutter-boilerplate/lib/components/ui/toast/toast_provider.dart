import 'package:flutter/material.dart';

class ToastProvider extends StatefulWidget {
  final Widget child;

  const ToastProvider({super.key, required this.child});

  @override
  State<ToastProvider> createState() => ToastProviderState();

  static ToastProviderState? of(BuildContext context) {
    return context.findAncestorStateOfType<ToastProviderState>();
  }
}

class ToastProviderState extends State<ToastProvider> {
  final GlobalKey<ScaffoldMessengerState> _scaffoldMessengerKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      scaffoldMessengerKey: _scaffoldMessengerKey,
      home: widget.child,
    );
  }
}

import 'package:flutter/material.dart';

class DialogWidget extends StatelessWidget {
  final String? title;
  final String? description;
  final Widget? content;
  final List<Widget> actions;
  final Widget? trigger;

  const DialogWidget({
    super.key,
    this.title,
    this.description,
    this.content,
    this.actions = const [],
    this.trigger,
  });

  static Future<T?> show<T>(BuildContext context, {
    String? title,
    String? description,
    Widget? content,
    List<Widget> actions = const [],
  }) {
    return showDialog<T>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: title != null ? Text(title) : null,
        content: content ?? (description != null ? Text(description) : null),
        actions: actions,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return trigger ?? const SizedBox.shrink();
  }
}

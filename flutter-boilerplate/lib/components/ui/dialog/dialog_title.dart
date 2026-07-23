import 'package:flutter/material.dart';

class DialogTitleWidget extends StatelessWidget {
  final String text;

  const DialogTitleWidget({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
      child: Text(
        text,
        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
      ),
    );
  }
}

import 'package:flutter/material.dart';

class DialogActionsRow extends StatelessWidget {
  final List<Widget> children;

  const DialogActionsRow({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          ...children.map((w) => Padding(
                padding: const EdgeInsets.only(left: 8),
                child: w,
              ),),
        ],
      ),
    );
  }
}

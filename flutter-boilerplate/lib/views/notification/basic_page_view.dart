import 'package:flutter/material.dart';

class BasicNotificationPage extends StatelessWidget {
  final String lang;

  const BasicNotificationPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Basic notification features'));
  }
}

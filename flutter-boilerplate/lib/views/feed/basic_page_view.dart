import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';

class BasicFeedPage extends StatelessWidget {
  final String lang;
  const BasicFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return const EmptyWidget(
      title: 'Basic Feed',
      description: 'Your basic feed experience.',
      icon: Icons.auto_awesome,
    );
  }
}

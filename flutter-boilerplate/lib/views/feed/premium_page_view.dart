import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';

class PremiumFeedPage extends StatelessWidget {
  final String lang;
  const PremiumFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return const EmptyWidget(
      title: 'Premium Feed',
      description: 'Full premium feed experience with AI recommendations.',
      icon: Icons.workspace_premium,
    );
  }
}

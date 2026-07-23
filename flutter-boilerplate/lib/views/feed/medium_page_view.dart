import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';

class MediumFeedPage extends StatelessWidget {
  final String lang;
  const MediumFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return const EmptyWidget(
      title: 'Medium Feed',
      description: 'Enhanced feed with analytics.',
      icon: Icons.trending_up,
    );
  }
}

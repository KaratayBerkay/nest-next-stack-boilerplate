import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class SharePageContent extends StatelessWidget {
  final String lang;

  const SharePageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Share')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.share, size: 48, color: colors.brand),
              const SizedBox(height: 16),
              const Text(
                'Share with friends',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Invite your friends to join.',
                style: TextStyle(color: colors.fgMuted),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.share),
                label: const Text('Share Link'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

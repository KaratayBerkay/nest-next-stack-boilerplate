import 'package:flutter/material.dart';
import '../../../components/ui/skeleton/skeleton.dart';
import '../../../l10n/app_localizations.dart';

class SkeletonDemoPage extends StatelessWidget {
  final String lang;
  const SkeletonDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiSkeletonTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Card Skeleton',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          SkeletonCard(),
          SizedBox(height: 24),
          Text(
            'Text Skeleton',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Skeleton(),
          SizedBox(height: 24),
          Text(
            'Avatar Skeleton',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          SkeletonCircle(),
        ],
      ),
    );
  }
}

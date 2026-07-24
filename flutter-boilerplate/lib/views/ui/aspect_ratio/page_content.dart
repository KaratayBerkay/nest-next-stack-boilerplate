import 'package:flutter/material.dart';
import '../../../components/ui/card/card.dart';
import '../../../l10n/app_localizations.dart';

class AspectRatioDemoPage extends StatelessWidget {
  final String lang;
  const AspectRatioDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiAspectRatioTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CardWidget(
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: Container(
                color: Colors.grey[300],
                child: const Center(child: Text('16:9')),
              ),
            ),
          ),
          const SizedBox(height: 12),
          CardWidget(
            child: AspectRatio(
              aspectRatio: 4 / 3,
              child: Container(
                color: Colors.grey[200],
                child: const Center(child: Text('4:3')),
              ),
            ),
          ),
          const SizedBox(height: 12),
          CardWidget(
            child: AspectRatio(
              aspectRatio: 1 / 1,
              child: Container(
                color: Colors.grey[100],
                child: const Center(child: Text('1:1')),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

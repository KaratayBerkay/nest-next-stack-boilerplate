import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class CarouselDemoPage extends StatelessWidget {
  final String lang;
  const CarouselDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiCarouselTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SizedBox(
            height: 200,
            child: PageView(
              children: items
                  .map(
                    (item) => Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: colors.primaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(item, style: const TextStyle(fontSize: 24)),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

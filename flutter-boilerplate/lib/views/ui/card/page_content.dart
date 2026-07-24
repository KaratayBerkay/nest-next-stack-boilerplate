import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/card/card.dart';
import '../../../components/ui/card/card_content.dart';
import '../../../components/ui/card/card_footer.dart';
import '../../../components/ui/card/card_header.dart';
import '../../../l10n/app_localizations.dart';

class CardDemoPage extends StatelessWidget {
  final String lang;
  const CardDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiCardTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Basic Card',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const CardWidget(
            child: Text('This is a basic card with some content.'),
          ),
          const SizedBox(height: 24),
          const Text(
            'Card with Header & Footer',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          CardWidget(
            child: Column(
              children: [
                const CardHeader(child: Text('Card Title')),
                const CardContent(child: Text('Card body content goes here.')),
                CardFooter(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Button(
                        variant: ButtonVariant.ghost,
                        child: const Text('Cancel'),
                        onPressed: () {},
                      ),
                      const SizedBox(width: 8),
                      Button(child: const Text('Save'), onPressed: () {}),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Tappable Card',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const CardWidget(
            child: ListTile(
              leading: Icon(Icons.star),
              title: Text('Tappable Card'),
              subtitle: Text('Tap to interact'),
              trailing: Icon(Icons.chevron_right),
            ),
          ),
        ],
      ),
    );
  }
}

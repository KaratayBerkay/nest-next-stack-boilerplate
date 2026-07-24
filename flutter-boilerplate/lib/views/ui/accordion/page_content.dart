import 'package:flutter/material.dart';
import '../../../components/ui/accordion/accordion.dart';
import '../../../l10n/app_localizations.dart';

class AccordionDemoPage extends StatelessWidget {
  final String lang;
  const AccordionDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiAccordionTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          AccordionWidget(
            items: [
              AccordionItem(
                title: 'Section 1',
                content: Text('Content for section 1'),
              ),
              AccordionItem(
                title: 'Section 2',
                content: Text('Content for section 2'),
              ),
              AccordionItem(
                title: 'Section 3',
                content: Text('Content for section 3'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

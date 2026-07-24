import 'package:flutter/material.dart';
import '../../../components/ui/separator/separator.dart';
import '../../../l10n/app_localizations.dart';

class SeparatorDemoPage extends StatelessWidget {
  final String lang;
  const SeparatorDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiSeparatorTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Above separator'),
          Separator(),
          Text('Below separator'),
          SizedBox(height: 24),
          SizedBox(
            height: 100,
            child: Row(
              children: [
                Expanded(child: Text('Left')),
                VerticalSeparator(),
                Expanded(child: Text('Right')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

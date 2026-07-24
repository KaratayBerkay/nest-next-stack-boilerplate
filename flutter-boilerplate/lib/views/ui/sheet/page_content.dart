import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/sheet/sheet.dart';
import '../../../l10n/app_localizations.dart';

class SheetDemoPage extends StatelessWidget {
  final String lang;
  const SheetDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiSheetTitle)),
      body: Center(
        child: Button(
          child: const Text('Open Sheet'),
          onPressed: () => showModalBottomSheet<bool>(
            context: context,
            builder: (_) => const SheetWidget(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(title: Text('Option 1')),
                  ListTile(title: Text('Option 2')),
                  ListTile(title: Text('Option 3')),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

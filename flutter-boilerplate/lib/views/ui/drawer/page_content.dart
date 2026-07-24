import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/drawer/drawer.dart';
import '../../../l10n/app_localizations.dart';

class DrawerDemoPage extends StatelessWidget {
  final String lang;
  const DrawerDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiDrawerTitle)),
      drawer: const DrawerWidget(
        child: Column(
          children: [
            DrawerHeader(child: Text('Menu')),
            ListTile(title: Text('Item 1')),
            ListTile(title: Text('Item 2')),
            ListTile(title: Text('Item 3')),
          ],
        ),
      ),
      body: Center(
        child: Button(
          child: const Text('Open Drawer'),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
      ),
    );
  }
}

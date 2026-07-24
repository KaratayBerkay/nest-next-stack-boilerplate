import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class ImagesDemo extends StatelessWidget {
  const ImagesDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoImagesTitle)),
      body: Center(
        child: Text(t.demoImagesDescription),
      ),
    );
  }
}

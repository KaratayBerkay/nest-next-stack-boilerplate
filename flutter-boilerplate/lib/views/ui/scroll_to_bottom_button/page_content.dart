import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class ScrollToBottomButtonDemoPage extends StatelessWidget {
  final String lang;
  const ScrollToBottomButtonDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiScrollToBottomButtonTitle)),
      body: Center(child: Text(t.uiScrollToBottomButtonHint)),
    );
  }
}
